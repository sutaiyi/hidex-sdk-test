import axios from "axios";

export const swapSign = async (chainId: number, walletAddress: string) => {
  const url = `/api/frontend/public/swap/commission`;
  const response = await axios.post(
    url,
    { chainId, walletAddress },
    {
      headers: {
        "Content-Type": "application/json",
        tgAuth: 'user=%7B%22id%22%3A6454172312%2C%22first_name%22%3A%22fortune%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22testrain1234%22%2C%22language_code%22%3A%22zh-hans%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2Fne6U-AfARp_cFbB10CEBEP6ArgcjOT1BT06ROOYJ0PBr3ln58qQ-gCXXdVWIdKra.svg%22%7D&chat_instance=7418312569443447313&chat_type=sender&start_param=chain-SOLANA_address-3Rhg36MkPgW4RCCWwSHK2wxi4jFeMbjnRAZL5yVNpump_path-Transfer_fromRouter-tg&auth_date=1731641169&hash=efd2cd52ae1c112f9f1af5e54718ad186f3daecd72659a2ab5a58f00514f5aaa',
      },
    }
  );
  console.log(response);
  if (response.status === 200 && response.data.code === 200) {
    return response.data.data;
  }
  throw new Error("Failed to get swap sign");
};