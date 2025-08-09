import { SignIn } from '@clerk/nextjs';
import '../../../styles/sign-in.css';

export default function SignInPage() {
  return (
    <div className="sign-in-page">
      <div className="sign-in-container">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          afterSignInUrl="/dashboard"
        />
      </div>
    </div>
  );
}