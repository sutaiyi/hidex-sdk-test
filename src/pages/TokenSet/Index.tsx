import React, { useEffect } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface FormData {
  accessToken:string,
}

export default React.memo(() => {
  const { register, handleSubmit, setError, formState: { errors }, setValue, watch, clearErrors } = useForm<FormData>();
  const watchFields = watch('accessToken'); // 实时监听 accessToken 字段
  const onSubmit = (data: FormData) => {
    localStorage.setItem('access_token', data.accessToken);
    window.location.reload();
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    // 只有存在本地 token 且输入框为空时才显示错误
    if (token && !watchFields) {
      setError("accessToken", {
        type: 'manual',
        message: 'Access token 无效或者过期，请重新输入'
      });
    } else {
      clearErrors("accessToken");
    }
  }, [watchFields, setError, clearErrors])

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">设置你的Access Token</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">access_token</label>
          <input type="text" {...register("accessToken", { required: "请输入AccessToken" })} className="w-full border p-2 rounded" />
          {errors.accessToken && <p className="text-red-500 text-sm">{errors.accessToken.message}</p>}
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
          提交
        </button>
      </form>
    </div>
  );
})
