import { isAuthenticated } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import {ReactNode} from "react";

const authlayout = async ({Children}: {Children: ReactNode}) => {
  const isUserAuthenticated = await isAuthenticated();
    if (!isUserAuthenticated) redirect('/');
     
  return (
    <div className="auth-layout">{Children}</div>
  )
}
export default authlayout;