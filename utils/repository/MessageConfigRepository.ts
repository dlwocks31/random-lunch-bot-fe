import { SupabaseClient } from "@supabase/supabase-js";

export class MessageConfigRepository {
  constructor(private supabaseClient: SupabaseClient) {}

  async save(config: { template: string; channel: string }) {
    await this.supabaseClient
      .from("message_config")
      .upsert(config, { onConflict: "user_id" });
  }

  async load(): Promise<{ template?: string; channel?: string }> {
    const result = await this.supabaseClient.from("message_config").select("*");
    if (result.error) {
      console.error(result.error);
      return {};
    }
    if (result.data.length > 0) {
      const elem = result.data[0];
      return {
        template: elem.template,
        channel: elem.channel,
      };
    }
    return {};
  }
}
