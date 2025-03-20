import React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface FormData {
  email: string;
  password: string;
  code: string;
}

export default React.memo(() => {
  const { register, handleSubmit, setError, formState: { errors } } = useForm<FormData>();
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const sendVerificationCode = () => {
    setIsSendingCode(true);
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(code);
      alert(`验证码: ${code}`); // 模拟验证码发送
      setIsSendingCode(false);
    }, 1000);
  };

  const onSubmit = (data: FormData) => {
    if (data.code !== verificationCode) {
      setError("code", { type: "manual", message: "验证码错误" });
      return;
    }
    alert("表单提交成功！");
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">账号注册/登录</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">邮箱</label>
          <input type="email" {...register("email", { required: "请输入邮箱" })} className="w-full border p-2 rounded" />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block mb-1">密码</label>
          <input type="password" {...register("password", { required: "请输入密码" })} className="w-full border p-2 rounded" />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block mb-1">验证码</label>
          <div className="flex gap-2">
            <input type="text" {...register("code", { required: "请输入验证码" })} className="w-full border p-2 rounded" />
            <button type="button" onClick={sendVerificationCode} disabled={isSendingCode} className="px-1 py-2 w-[160px] text-sm bg-blue-500 text-white rounded">
              {isSendingCode ? "发送中..." : "发送验证码"}
            </button>
          </div>
          {errors.code && <p className="text-red-500 text-sm">{errors.code.message}</p>}
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
          提交
        </button>
      </form>
    </div>
  );
})
