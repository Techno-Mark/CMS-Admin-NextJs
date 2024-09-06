const ResetPassword = ({ mode, token }: { mode: string, token: string }) => {
    return (
      <div>
        <h1>Reset Password</h1>
        <p>Token: {token}</p>
        {/* Form for entering a new password */}
        <form>
          <input type="password" placeholder="Enter new password" />
          <button type="submit">Reset Password</button>
        </form>
      </div>
    );
  }
  
  export default ResetPassword;
  