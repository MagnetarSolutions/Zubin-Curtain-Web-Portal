import React, { useState } from "react";
import Header from "../Components/Header";
import Frontimages from "../Components/Frontimages";
import Customerinfo from "../Components/Customerinfo";
import CurtainForm from "../Components/CurtainForm";
import TermsAndConditions from "../Components/TermsCondition";

function Home() {
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    address: "",
  });

  return (
    <div>
      <Header />
      <Frontimages />
      <Customerinfo customerData={customerData} setCustomerData={setCustomerData} />
      <CurtainForm customerData={customerData} />
      <TermsAndConditions />
    </div>
  );
}

export default Home;