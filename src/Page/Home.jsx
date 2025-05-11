import React from "react";
import Header from "../Components/Header";
import Frontimages from "../Components/Frontimages";
import CurtainForm from "../Components/CurtainForm";
import TermsAndConditions from "../Components/TermsCondition";

function Home() {
  return (
    <div>
      <Header />
      <Frontimages />
      <CurtainForm />
      <TermsAndConditions />
    </div>
  );
}

export default Home;