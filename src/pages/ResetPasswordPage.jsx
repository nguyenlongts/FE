import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    if (password.length < 6) return setError("Mật khẩu tối thiểu 6 ký tự");
    if (password !== confirm) return setError("Mật khẩu không khớp");

    const res = await fetch(
      "https://kiritsu2210-001-site1.rtempurl.com/api/auth/reset-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      }
    );

    const data = await res.json();
    if (data.returnCode === 200) {
      alert("Đặt lại mật khẩu thành công");
      navigate("/login");
    } else {
      setError(data.message);
    }
  };

  return (
    <div>
      <h2>Đặt lại mật khẩu</h2>
      {error && <p>{error}</p>}
      <input
        type="password"
        placeholder="Mật khẩu mới"
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Xác nhận mật khẩu"
        onChange={(e) => setConfirm(e.target.value)}
      />
      <button onClick={submit}>Xác nhận</button>
    </div>
  );
}

export default ResetPasswordPage;
