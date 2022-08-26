export const verifyCodeMail = ({ code, username }) => {
  return `Hello ${username}
  <br>
  <br>

  You registered an account on <a href='https://checkpoint.guide'>Checkpoint</a>, before being able to use your account <br> you need to verify that this is your email address by use that code: <b>${code}</b>

  <br>
  <br>
  Kind Arthur, Checkpoint`;
};
