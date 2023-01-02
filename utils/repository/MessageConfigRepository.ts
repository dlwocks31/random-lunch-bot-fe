export class MessageConfigRepository {
  private static readonly LOCALSTORAGE_KEY = "message_config";

  save(config: { template: string; channel: string }) {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      MessageConfigRepository.LOCALSTORAGE_KEY,
      JSON.stringify(config),
    );
  }

  load(): { template?: string; channel?: string } {
    if (typeof window === "undefined") return {};
    const config = localStorage.getItem(
      MessageConfigRepository.LOCALSTORAGE_KEY,
    );
    if (config) {
      return JSON.parse(config);
    }
    return {};
  }
}
