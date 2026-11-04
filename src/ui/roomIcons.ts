export const ROOM_ICONS: Record<string, string> = {
  // Tier 1
  entrance_hall: 'M8 2L2 6v8h12V6L8 2zM6 14v-4h4v4',
  kitchen: 'M3 6h10v6H3V6zM6 6V4M10 6V4M3 9h10',
  wine_cellar: 'M4 6a4 3 0 018 0v4a4 3 0 01-8 0V6zM6 10h4',
  library: 'M3 2h10v12H3V2zM5 4h6M5 6h6M5 8h4',
  study: 'M2 4h12v8H2V4zM5 12v2h6v-2M8 4V2',
  garden: 'M8 14V8M5 6c1 2 3 3 3 3M11 6c-1 2-3 3-3 3M3 14h10M6 11c-2 0-3 1-3 3M10 11c2 0 3 1 3 3',
  drawing_room: 'M3 3h10v10H3V3zM3 9h10M6 3v6M10 3v6',
  servants_quarters: 'M3 3h10v10H3V3zM3 8h10M8 3v10',
  nursery: 'M4 8a4 4 0 018 0M8 4V2M6 12h4M3 14h10',
  portrait_gallery: 'M4 3h8v10H4V3zM6 6h4v3H6V6',
  music_room: 'M4 10c0-4 8-4 8 0v3H4v-3zM6 7V4M10 7V4',
  conservatory: 'M3 4h10v8H3V4zM3 4l5-2 5 2M5 8v4M8 6v6M11 8v4',
  coat_room: 'M5 2v4M8 2v4M11 2v4M3 6h10v8H3V6z',
  pantry: 'M3 4h10v10H3V4zM5 7h6M5 9h4M5 11h6',
  chapel: 'M8 2v3M5 5h6M8 5v7M4 14h8M8 12l-4 2M8 12l4 2',

  // Tier 2
  ballroom: 'M2 12h12M4 12V6l4-3 4 3v6M7 12V9h2v3',
  billiard_room: 'M3 5h10v6H3V5zM5 8a1 1 0 110-2 1 1 0 010 2M8 8a1 1 0 110-2 1 1 0 010 2M11 8a1 1 0 110-2 1 1 0 010 2',
  infirmary: 'M7 3h2v10H7V3zM4 6h8v2H4V6z',
  bell_tower: 'M8 2v2M6 4h4M5 4v7M11 4v7M3 11h10M6 11v3M10 11v3',
  greenhouse: 'M3 4h10v8H3V4zM3 4c0-2 5-3 5-3s5 1 5 3M6 4v8M10 4v8',

  // Tier 3
  vault: 'M3 4h10v8H3V4zM3 4l5-2 5 2M8 7a2 2 0 110 4 2 2 0 010-4z',
  observatory: 'M5 14V8l3-6 3 6v6M4 14h8M8 2v2',
  seance_room: 'M8 3a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5zM8 6v4M6 8h4',
  hidden_passage: 'M3 3h4v10H3V3zM9 3h4v10H9V3zM7 7h2',
  housekeepers_office: 'M3 3h10v10H3V3zM6 3v10M3 7h3M6 10h7',

  // Tier 4
  sealed_bedroom: 'M3 3h10v10H3V3zM8 3v10M3 8h10M6 6a1 1 0 110-2 1 1 0 010 2',
  dungeon: 'M4 2v12M8 2v12M12 2v12M2 6h12M2 10h12',
  clocktower: 'M8 2a5 5 0 015 5v5H3V7a5 5 0 015-5zM8 5v3h2',
  catacombs: 'M3 10h10M5 10V6M8 10V4M11 10V6M3 13h10M5 13v-3M11 13v-3',
  the_archive: 'M3 2h10v12H3V2zM5 4h6M5 6h6M5 8h6M5 10h4M3 2l5-1 5 1',
};

export const DEFAULT_ICON = 'M4 4h8v8H4z';

export function getRoomIcon(roomId: string): string {
  return ROOM_ICONS[roomId] ?? DEFAULT_ICON;
}
