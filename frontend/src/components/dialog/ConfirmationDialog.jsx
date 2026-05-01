import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle className="border-b text-lg font-semibold">
        {title || "Are you sure?"}
      </DialogTitle>

      <DialogContent className="mt-2">
        <p className="text-sm text-gray-700">{message}</p>
      </DialogContent>

      <DialogActions className="border-t p-3 flex justify-end gap-2">
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;