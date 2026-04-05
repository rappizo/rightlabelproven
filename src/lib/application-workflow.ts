import "server-only";

export const APPLICATION_STAGE_CONFIG = [
  {
    key: "REVIEWING",
    title: "Reviewing",
    durationDays: 2,
    durationLabel: "2 business days",
    description: "Initial compliance review of the submitted dossier and manufacturing materials.",
  },
  {
    key: "PAYMENT_ISSUING",
    title: "Payment Issuing",
    durationDays: null,
    durationLabel: "Awaiting payment",
    description: "Commercial quotation, invoice release, and payment clearance.",
  },
  {
    key: "PURCHASING_PRODUCT_ON_MARKET",
    title: "Purchasing Product on Market",
    durationDays: 5,
    durationLabel: "3-5 business days",
    description: "Blind retail sample acquisition from the consumer market.",
  },
  {
    key: "LAB_ANALYZING",
    title: "Lab Analyzing",
    durationDays: 10,
    durationLabel: "10 business days",
    description: "Analytical testing, label-claim assessment, and contamination screening.",
  },
  {
    key: "CERTIFICATION_ISSUING",
    title: "Certification Issuing",
    durationDays: 2,
    durationLabel: "2 business days",
    description: "Final report assembly, certificate release, and registry activation.",
  },
] as const;

export type ApplicationWorkflowStageKey =
  | "SUBMITTED"
  | "REJECTED"
  | "CERTIFIED"
  | (typeof APPLICATION_STAGE_CONFIG)[number]["key"];

export type ApplicationWorkflowRecord = {
  id: string;
  applicationId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  facilityLocation: string;
  gmpCertified: boolean;
  gmpCertificateBody?: string | null;
  productName: string;
  productCategory: string;
  dossierUrl?: string | null;
  message: string;
  status: string;
  reviewDecision?: string | null;
  reviewApprovedAt?: string | Date | null;
  reviewRejectedAt?: string | Date | null;
  rejectionReason?: string | null;
  reviewNotes?: string | null;
  invoiceAmountCents?: number | null;
  currencyCode?: string | null;
  invoiceIssuedAt?: string | Date | null;
  invoiceReference?: string | null;
  paymentStatus?: string | null;
  paidAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type WorkflowStageView = {
  key: ApplicationWorkflowStageKey;
  title: string;
  durationLabel: string;
  description: string;
  state: "complete" | "current" | "upcoming" | "blocked";
  detail: string;
};

type ApplicationWorkflowSummary = {
  decisionLabel: string;
  decisionTone: "neutral" | "success" | "danger";
  currentStageKey: ApplicationWorkflowStageKey;
  currentStageLabel: string;
  headline: string;
  detail: string;
  progressPercent: number;
  stages: WorkflowStageView[];
  invoiceDisplay: string | null;
  paymentStateLabel: string;
};

function asDate(value?: string | Date | null) {
  return value ? new Date(value) : null;
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function generateApplicationId() {
  const today = new Date();
  const datePart = `${today.getUTCFullYear()}${String(today.getUTCMonth() + 1).padStart(2, "0")}${String(
    today.getUTCDate(),
  ).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RLP-${datePart}-${randomPart}`;
}

export function formatCurrencyCents(value?: number | null, currencyCode = "USD") {
  if (typeof value !== "number") {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(value / 100);
}

export function getApplicationWorkflowSummary(
  submission: ApplicationWorkflowRecord,
  now = new Date(),
): ApplicationWorkflowSummary {
  const approvedAt = asDate(submission.reviewApprovedAt);
  const rejectedAt = asDate(submission.reviewRejectedAt);
  const invoiceIssuedAt = asDate(submission.invoiceIssuedAt);
  const paidAt = asDate(submission.paidAt);
  const invoiceDisplay = formatCurrencyCents(submission.invoiceAmountCents, submission.currencyCode || "USD");

  if (rejectedAt || submission.reviewDecision === "REJECTED") {
    return {
      decisionLabel: "Rejected",
      decisionTone: "danger",
      currentStageKey: "REJECTED",
      currentStageLabel: "Application Rejected",
      headline: "Application rejected",
      detail:
        submission.rejectionReason ||
        "The submission did not satisfy the current intake requirements for Right Label Proven review.",
      progressPercent: 100,
      invoiceDisplay,
      paymentStateLabel: "Not applicable",
      stages: [
        {
          key: "SUBMITTED",
          title: "Application Submitted",
          durationLabel: "Complete",
          description: "Structured intake record created and queued for review.",
          state: "complete",
          detail: "Application ID issued and stored in the admin queue.",
        },
        {
          key: "REJECTED",
          title: "Rejected",
          durationLabel: "Final",
          description: "Application closed with a rejection decision.",
          state: "current",
          detail:
            submission.rejectionReason ||
            "The application was declined before the commercial and laboratory workflow began.",
        },
      ],
    };
  }

  if (!approvedAt) {
    return {
      decisionLabel: "Pending Review",
      decisionTone: "neutral",
      currentStageKey: "SUBMITTED",
      currentStageLabel: "Awaiting Approval",
      headline: "Awaiting internal approval",
      detail:
        "The intake has been received and assigned an Application ID. The internal team must approve the file before workflow timing begins.",
      progressPercent: 5,
      invoiceDisplay,
      paymentStateLabel: "Not issued",
      stages: [
        {
          key: "SUBMITTED",
          title: "Application Submitted",
          durationLabel: "Current",
          description: "Structured intake record created and queued for review.",
          state: "current",
          detail: "Pending approval from the Right Label Proven review team.",
        },
        ...APPLICATION_STAGE_CONFIG.map((stage) => ({
          key: stage.key,
          title: stage.title,
          durationLabel: stage.durationLabel,
          description: stage.description,
          state: "blocked" as const,
          detail: "This stage will begin after the application is approved.",
        })),
      ],
    };
  }

  const reviewEndsAt = addDays(approvedAt, 2);
  const purchaseStartsAt = paidAt;
  const purchaseEndsAt = purchaseStartsAt ? addDays(purchaseStartsAt, 5) : null;
  const labEndsAt = purchaseEndsAt ? addDays(purchaseEndsAt, 10) : null;
  const certificationEndsAt = labEndsAt ? addDays(labEndsAt, 2) : null;

  let currentStageKey: ApplicationWorkflowStageKey = "REVIEWING";
  let currentStageLabel = "Reviewing";
  let headline = "Application in review";
  let detail =
    "The approved submission is undergoing dossier review and compliance assessment before invoicing.";
  let paymentStateLabel = invoiceIssuedAt ? "Invoice issued" : "Awaiting invoice";

  if (now < reviewEndsAt) {
    currentStageKey = "REVIEWING";
  } else if (!invoiceIssuedAt) {
    currentStageKey = "PAYMENT_ISSUING";
    currentStageLabel = "Payment Issuing";
    headline = "Review complete, invoice pending";
    detail =
      "The review window has ended. The next operational step is to configure and issue the invoice for the approved application.";
  } else if (!paidAt) {
    currentStageKey = "PAYMENT_ISSUING";
    currentStageLabel = "Payment Issuing";
    headline = "Awaiting customer payment";
    detail = invoiceDisplay
      ? `Invoice ${submission.invoiceReference || ""}`.trim()
        ? `Invoice ${submission.invoiceReference || ""} has been issued for ${invoiceDisplay}. Workflow advances once payment is confirmed.`
        : `An invoice for ${invoiceDisplay} has been issued. Workflow advances once payment is confirmed.`
      : "The invoice has been issued. Workflow advances once payment is confirmed.";
    paymentStateLabel = "Awaiting payment";
  } else if (purchaseEndsAt && now < purchaseEndsAt) {
    currentStageKey = "PURCHASING_PRODUCT_ON_MARKET";
    currentStageLabel = "Purchasing Product on Market";
    headline = "Retail sample acquisition in progress";
    detail =
      "Payment has been recorded and the blind market purchase window is active. Retail-facing samples are being sourced for laboratory submission.";
    paymentStateLabel = "Paid";
  } else if (labEndsAt && now < labEndsAt) {
    currentStageKey = "LAB_ANALYZING";
    currentStageLabel = "Lab Analyzing";
    headline = "Laboratory analysis in progress";
    detail =
      "The market sample acquisition stage is complete and the product is currently undergoing analytical testing.";
    paymentStateLabel = "Paid";
  } else if (certificationEndsAt && now < certificationEndsAt) {
    currentStageKey = "CERTIFICATION_ISSUING";
    currentStageLabel = "Certification Issuing";
    headline = "Certification package in preparation";
    detail =
      "Analytical review is complete. The certification package and registry activation are being finalized.";
    paymentStateLabel = "Paid";
  } else if (certificationEndsAt) {
    currentStageKey = "CERTIFIED";
    currentStageLabel = "Certification Complete";
    headline = "Certification complete";
    detail =
      "The application has completed the review, invoicing, purchasing, laboratory, and certification workflow.";
    paymentStateLabel = "Paid";
  }

  const stages: WorkflowStageView[] = APPLICATION_STAGE_CONFIG.map((stage) => {
    let state: WorkflowStageView["state"] = "upcoming";
    let stageDetail: string = stage.description;

    if (stage.key === "REVIEWING") {
      if (currentStageKey === "REVIEWING") {
        state = "current";
        stageDetail = `Estimated completion by ${reviewEndsAt.toLocaleDateString("en-US")}.`;
      } else {
        state = "complete";
        stageDetail = `Review approved on ${approvedAt.toLocaleDateString("en-US")}.`;
      }
    }

    if (stage.key === "PAYMENT_ISSUING") {
      if (currentStageKey === "REVIEWING") {
        state = "upcoming";
      } else if (currentStageKey === "PAYMENT_ISSUING") {
        state = "current";
        stageDetail = invoiceIssuedAt
          ? invoiceDisplay
            ? `Invoice issued for ${invoiceDisplay}. Waiting for payment confirmation.`
            : "Invoice issued. Waiting for payment confirmation."
          : "Awaiting invoice amount entry and issue approval.";
      } else {
        state = "complete";
        stageDetail = paidAt
          ? `Payment recorded on ${paidAt.toLocaleDateString("en-US")}.`
          : "Invoice stage completed.";
      }
    }

    if (stage.key === "PURCHASING_PRODUCT_ON_MARKET") {
      if (!paidAt) {
        state = currentStageKey === "PAYMENT_ISSUING" ? "blocked" : "upcoming";
        stageDetail = "Begins immediately after payment is confirmed.";
      } else if (currentStageKey === "PURCHASING_PRODUCT_ON_MARKET") {
        state = "current";
        stageDetail = `Retail acquisition is in progress. Estimated completion by ${purchaseEndsAt?.toLocaleDateString("en-US")}.`;
      } else if (purchaseEndsAt && now >= purchaseEndsAt) {
        state = "complete";
        stageDetail = `Retail acquisition target completed by ${purchaseEndsAt.toLocaleDateString("en-US")}.`;
      }
    }

    if (stage.key === "LAB_ANALYZING") {
      if (!purchaseEndsAt || now < purchaseEndsAt) {
        state = paidAt ? "upcoming" : "blocked";
        stageDetail = "Begins after retail sample acquisition is complete.";
      } else if (currentStageKey === "LAB_ANALYZING") {
        state = "current";
        stageDetail = `Laboratory review is active. Estimated completion by ${labEndsAt?.toLocaleDateString("en-US")}.`;
      } else if (labEndsAt && now >= labEndsAt) {
        state = "complete";
        stageDetail = `Analytical review target completed by ${labEndsAt.toLocaleDateString("en-US")}.`;
      }
    }

    if (stage.key === "CERTIFICATION_ISSUING") {
      if (!labEndsAt || now < labEndsAt) {
        state = paidAt ? "upcoming" : "blocked";
        stageDetail = "Begins after laboratory analysis is complete.";
      } else if (currentStageKey === "CERTIFICATION_ISSUING") {
        state = "current";
        stageDetail = `Certification package is being finalized. Estimated completion by ${certificationEndsAt?.toLocaleDateString("en-US")}.`;
      } else if (currentStageKey === "CERTIFIED") {
        state = "complete";
        stageDetail = `Certification workflow completed by ${certificationEndsAt?.toLocaleDateString("en-US")}.`;
      }
    }

    return {
      key: stage.key,
      title: stage.title,
      durationLabel: stage.durationLabel,
      description: stage.description,
      state,
      detail: stageDetail,
    };
  });

  const completedStageCount = stages.filter((stage) => stage.state === "complete").length;
  const inProgressBonus = currentStageKey === "CERTIFIED" ? 1 : 0.5;
  const progressPercent =
    currentStageKey === "CERTIFIED"
      ? 100
      : Math.round(((completedStageCount + inProgressBonus) / stages.length) * 100);

  return {
    decisionLabel: "Approved",
    decisionTone: "success",
    currentStageKey,
    currentStageLabel,
    headline,
    detail,
    progressPercent,
    stages,
    invoiceDisplay,
    paymentStateLabel,
  };
}
