// Cell
const hexagon_angle = 2 * Math.PI / 6.;

// Grid
let grid_size = { x: 60, y: 30 };
let grid = [];
let grid_boundaries = { x: 0, y: 0, width: 0, height: 0 };

// Camera
let camera;
let inital_camera_zoom = 50.;

// User
let user;
let joined = false;

// Move
let dragging = false;
let drag_from = { x: 0, y:0 };
let drag_to = { x: 0, y:0 };
let cell_from;
let cell_to;

// Move Clic
let move_is_cell_from = false;
let move_cell_from;
let move_x;
let move_y;