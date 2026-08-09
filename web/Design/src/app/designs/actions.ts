// Keep the public route compatible with the existing server-action module.
// The implementation remains in the private route so the static desktop
// export does not accidentally expose the server-backed page itself.
export {
  createFolderAction,
  createDesignAction,
  createDesignFromCatalogTemplateAction,
  createDesignFromTemplateAction,
  deleteDesignAction,
  duplicateDesignAsSizeAction,
  moveDesignToFolderAction,
  permanentlyDeleteDesignAction,
  refreshVariantSourceMetadataAction,
  renameDesignAction,
  restoreDesignAction,
  setProjectLegalHoldAction,
  toggleStarDesignAction,
  updateApprovalStatusAction,
} from "../_designs/actions";
