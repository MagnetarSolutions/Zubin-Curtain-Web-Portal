import React from "react";

const TermsAndConditions = ({ agreed, setAgreed }) => (
  <div className="mt-6 px-20">
    <h3>Terms & Conditions</h3>
    <label className="flex items-start space-x-2">
      <input
        type="checkbox"
        checked={agreed}
        onChange={(e) => setAgreed(e.target.checked)}
        className="mt-1"
      />
      
      <span className="text-sm text-gray-700">
      By submitting this form, you confirm that the information provided, including your contact details and window measurements, is accurate to the best of your knowledge. These details will be used solely to assess your requirements and offer you the most suitable curtain options. Please note that accurate measurements are essential to ensure the perfect fit, and we may not be responsible for fitting issues resulting from incorrect data. All personal information submitted through this form will be kept strictly confidential and will not be shared with any third party without your permission. We may contact you via phone, email, or messaging apps to follow up on your request. Submission of this form does not imply a confirmed order; a team member will reach out to discuss further steps, pricing, and availability before finalizing any purchase.
        <br />
        (Full Terms Here...)
      </span>
    </label>
  </div>
);

export default TermsAndConditions;
