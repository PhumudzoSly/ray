import React from "react";
import SwitchOrg from "./SwitchOrg";
import { getMyOrgs } from "@/actions/account/user";

const OrgSelection = async () => {
  const orgs = await getMyOrgs();

  return (
    <div className="my-10 w-full min-h-screen mx-auto px-5">
      <SwitchOrg orgs={orgs} />
    </div>
  );
};

export default OrgSelection;
