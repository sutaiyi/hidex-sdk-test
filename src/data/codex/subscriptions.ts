import CodexSdk from "./sdk";
import { Codex } from "@codex-data/sdk";

class Subscriptions extends CodexSdk {
  constructor(apiKey: string) {
    super(apiKey);
  }
  async subscribeSDK(): Promise<Codex> {
    if (!this.shortLivedSdk) {
      await this.sdkInit();
    }
    return this.shortLivedSdk as Codex;
  }
}
export default Subscriptions;