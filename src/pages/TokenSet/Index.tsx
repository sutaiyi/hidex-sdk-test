import React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface FormData {
  accessToken:string,
}

export default React.memo(() => {
  const { register, handleSubmit, setError, formState: { errors } } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    localStorage.setItem('access_token', data.accessToken);
    window.location.reload();
  };

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
