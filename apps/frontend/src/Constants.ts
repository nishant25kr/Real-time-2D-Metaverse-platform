import type { Furniture } from './types';

export const CELL_SIZE = 20;

export const RTC_CONFIGURATION: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const FURNITURE: Furniture[] = [
  {
    room: { rotate: 0, minX: 2, maxX: 22, minY: 1, maxY: 20, name: "Room-A" },
    id: 'table-a1', type: 'rect-table', x: 4, y: 6, width: 16, height: 6,
    label: 'Meeting Room-A',
    chairs: [
      { dx: 1, dy: -1, rotate: 0, chairId: 1 },
      { dx: 5, dy: -1, rotate: 0, chairId: 2 },
      { dx: 9, dy: -1, rotate: 0, chairId: 3 },
      { dx: 13, dy: -1, rotate: 0, chairId: 4 },

      { dx: 1, dy: 6, rotate: 180, chairId: 5 },
      { dx: 5, dy: 6, rotate: 180, chairId: 6 },
      { dx: 9, dy: 6, rotate: 180, chairId: 7 },
      { dx: 13, dy: 6, rotate: 180, chairId: 8 },
    ]
  },
  {
    room: { rotate: 0, minX: 24, maxX: 44, minY: 1, maxY: 20, name: "Room-B" },
    id: 'table-a2', type: 'rect-table', x: 25, y: 6, width: 16, height: 6,
    label: 'Meeting Room-B',
    chairs: [
      { dx: 1, dy: -1, rotate: 0, chairId: 1 },
      { dx: 5, dy: -1, rotate: 0, chairId: 2 },
      { dx: 9, dy: -1, rotate: 0, chairId: 3 },
      { dx: 13, dy: -1, rotate: 180, chairId: 4 },

      { dx: 1, dy: 6, rotate: 180, chairId: 5 },
      { dx: 5, dy: 6, rotate: 180, chairId: 6 },
      { dx: 9, dy: 6, rotate: 180, chairId: 7 },
      { dx: 13, dy: 6, rotate: 180, chairId: 8 },
    ]
  },
  {
    room: { rotate: 0, minX: 46, maxX: 66, minY: 1, maxY: 20, name: "Room-C" },
    id: 'table-a3', type: 'rect-table', x: 47, y: 6, width: 16, height: 6,
    label: 'Meeting Room-C',
    chairs: [
      { dx: 1, dy: -1, rotate: 0, chairId: 1 },
      { dx: 5, dy: -1, rotate: 0, chairId: 2 },
      { dx: 9, dy: -1, rotate: 0, chairId: 3 },
      { dx: 13, dy: -1, rotate: 180, chairId: 4 },

      { dx: 1, dy: 6, rotate: 180, chairId: 5 },
      { dx: 5, dy: 6, rotate: 180, chairId: 6 },
      { dx: 9, dy: 6, rotate: 180, chairId: 7 },
      { dx: 13, dy: 6, rotate: 180, chairId: 8 },
    ]
  },
  {
    room: { rotate: 180, minX: 2, maxX: 22, minY: 30, maxY: 42, name: "Room-D" },
    id: 'table-a4', type: 'rect-table', x: 6, y: 33, width: 11, height: 5,
    label: 'Meeting Room-D',
    chairs: [
      { dx: 1, dy: -1, rotate: 0, chairId: 1 },
      { dx: 5, dy: -1, rotate: 0, chairId: 2 },
      { dx: 9, dy: -1, rotate: 0, chairId: 3 },

      { dx: 1, dy: 5, rotate: 180, chairId: 5 },
      { dx: 5, dy: 5, rotate: 180, chairId: 6 },
      { dx: 9, dy: 5, rotate: 180, chairId: 7 },
    ]
  },
  {
    room: { rotate: 180, minX: 22, maxX: 42, minY: 30, maxY: 42, name: "Room-E" },
    id: 'table-a5', type: 'rect-table', x: 26, y: 33, width: 11, height: 5,
    label: 'Meeting Room-E',
    chairs: [
      { dx: 1, dy: -1, rotate: 0, chairId: 1 },
      { dx: 5, dy: -1, rotate: 0, chairId: 2 },
      { dx: 9, dy: -1, rotate: 0, chairId: 3 },

      { dx: 1, dy: 5, rotate: 180, chairId: 5 },
      { dx: 5, dy: 5, rotate: 180, chairId: 6 },
      { dx: 9, dy: 5, rotate: 180, chairId: 7 },
    ]
  },
];

export const INDIVIDUAL_TABLES: any[] = [  
  {
    name:"Table1",x: 47, y: 33, width: 3, height: 3, type: 'rect-table',
    label: 'T1',
    chairs: [
      { dx: 1, dy: -1, rotate: 0, chairId: 1 },
      { dx: 1, dy: 3, rotate: 180, chairId: 5 },
    ],
  },
  {
    name:"Table2",x: 53, y: 33, width: 3, height: 3, type: 'rect-table',
    label: 'T1',
    chairs: [
      { dx: 1, dy: -1, rotate: 0, chairId: 1 },
      { dx: 1, dy: 3, rotate: 180, chairId: 5 },
    ],
  },
  {
    name:"Table3",x: 59, y: 33, width: 3, height: 3, type: 'rect-table',
    label: 'T1',
    chairs: [
      { dx: 1, dy: -1, rotate: 0, chairId: 1 },
      { dx: 1, dy: 3, rotate: 180, chairId: 5 },
    ],
  },
  {
    name:"Table4",x: 65, y: 33, width: 3, height: 3, type: 'rect-table',
    label: 'T1',
    chairs: [
      { dx: 1, dy: -1, rotate: 0, chairId: 1 },
      { dx: 1, dy: 3, rotate: 180, chairId: 5 },
    ],
  },
  {
    name:"Table5",x: 71, y: 33, width: 3, height: 3, type: 'rect-table',
    label: 'T1',
    chairs: [
      { dx: 1, dy: -1, rotate: 0, chairId: 1 },
      { dx: 1, dy: 3, rotate: 180, chairId: 5 },
    ],
  },
  // {
  //   x: 75 , y: 7 , width: 3, height: 3, type: 'round-table',
  //   label: 'T1',
  //   chairs: [
  //     { dx: 1, dy: -1, rotate: 0, chairId: 1 },
  //     { dx: 1, dy: 3, rotate: 180, chairId: 5 },
  //   ],
  // }
];