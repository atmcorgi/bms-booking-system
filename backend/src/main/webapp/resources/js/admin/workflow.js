// Global functions for inline onclick
function approveRequest(requestId) {
  if (confirm("Approve this request?")) {
    const form = document.getElementById("approveForm");
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "requestIds";
    input.value = requestId;
    form.appendChild(input);

    form.submit();
  }
}

function rejectRequest(requestId) {
  alert("Reject functionality not implemented yet");
}

// Checkbox functionality
document.addEventListener("DOMContentLoaded", function () {
  const selectAllCheckbox = document.getElementById("selectAll");
  const rowCheckboxes = document.querySelectorAll(".row-checkbox");
  const approveSelectedBtn = document.getElementById("approveSelectedBtn");

  function updateApproveButtonState() {
    const anyChecked = Array.from(rowCheckboxes).some((cb) => cb.checked);
    approveSelectedBtn.disabled = !anyChecked;
  }

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", function () {
      rowCheckboxes.forEach((cb) => {
        cb.checked = selectAllCheckbox.checked;
      });
      updateApproveButtonState();
    });
  }

  rowCheckboxes.forEach((cb) => {
    cb.addEventListener("change", function () {
      if (!this.checked) selectAllCheckbox.checked = false;
      else if (Array.from(rowCheckboxes).every((x) => x.checked)) {
        selectAllCheckbox.checked = true;
      }
      updateApproveButtonState();
    });
  });

  updateApproveButtonState();
});
