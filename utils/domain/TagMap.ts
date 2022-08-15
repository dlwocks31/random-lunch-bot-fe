export class TagMap {
  constructor(public readonly tags: { userId: string; tag: string }[]) {}

  tagToUserIdsMap(): { [tag: string]: string[] } {
    const map: { [tag: string]: string[] } = {};
    this.tags.forEach((tag) => {
      if (!map[tag.tag]) map[tag.tag] = [];
      if (tag.userId) {
        map[tag.tag].push(tag.userId);
      }
    });
    return map;
  }

  setUserIdsOfTag(tag: string, userIds: string[]): TagMap {
    const newTags = this.tags
      .filter((t) => t.tag !== tag)
      .concat(userIds.map((userId) => ({ userId, tag })));
    return new TagMap(newTags);
  }

  setNewTag(tag: string): TagMap {
    return this.setUserIdsOfTag(tag, [""]);
  }
}
