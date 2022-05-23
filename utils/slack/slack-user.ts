export class SlackUser {
  public constructor(
    public id: string,
    public displayName: string,
    public email: string,
    public statusEmoji: string,
    public statusMessage: string,
  ) {}
}
