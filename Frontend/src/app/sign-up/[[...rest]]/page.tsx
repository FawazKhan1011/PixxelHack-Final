import { SignUp } from '@clerk/nextjs';
import '../../../../src/styles/sign-up.css'

export default function SignUpPage() {
  return (
    <div className="sign-up-page">
      <div className="sign-up-container">
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          afterSignUpUrl="/assess"
        />
      </div>
    </div>
  );
}