import React from "react";
import leftimage from "../../src/images/leftimage.jpg";

const CustomerInfo = ({ customerData, setCustomerData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerData({
      ...customerData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate required fields
    if (
      !customerData.name ||
      !customerData.email ||
      !customerData.phone ||
      !customerData.date ||
      !customerData.address
    ) {
      alert("Please fill out all required fields.");
      return;
    }
    alert("Customer information saved. Please proceed to the curtain form.");
    console.log("Customer Data:", customerData);
  };

  return (
    <div className="w-[70%] mx-auto mt-20 p-6">
      <h2 className="text-4xl font-heading text-DarkBlue mb-4">Looking for the perfect curtains?</h2>
      <p className="text-DarkBlue font-body text-sm mb-6">
        Please fill out the form below with your contact information and curtain preferences. We'll
        review your details and get back to you with the best options for your space.
      </p>
      <div className="flex justify-center">
        <div className="relative flex-shrink-0 z-10">
          <div className="absolute left-[-8px] w-[460px] h-[300px] bg-[#edf4fa] -z-10"></div>
          <img src={leftimage} alt="Left Visual" className="w-[450px] h-[290px] object-cover" />
        </div>
        <div className="pl-12 w-full">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={customerData.name}
                onChange={handleChange}
                className="p-3 bg-[#edf4fa] placeholder-gray-500 text-gray-700 focus:outline-none"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                value={customerData.email}
                onChange={handleChange}
                className="p-3 bg-[#edf4fa] placeholder-gray-500 text-gray-700 focus:outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={customerData.phone}
                onChange={handleChange}
                className="p-3 bg-[#edf4fa] placeholder-gray-500 text-gray-700 focus:outline-none"
                required
              />
              <input
                type="date"
                name="date"
                value={customerData.date}
                onChange={handleChange}
                className="p-3 bg-[#edf4fa] text-gray-700 focus:outline-none"
                required
              />
            </div>
            <div className="mb-4">
              <textarea
                name="address"
                placeholder="Address"
                value={customerData.address}
                onChange={handleChange}
                className="w-full p-3 bg-[#edf4fa] placeholder-gray-500 text-gray-700 h-40 resize-none focus:outline-none"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors font-['Open_Sans'] text-sm"
            >
              Save Customer Information
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfo;