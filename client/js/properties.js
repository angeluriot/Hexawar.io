// Cell
const hexagon_angle = 2 * Math.PI / 6.;
const border_color = '#D3D4DC';
const dark_color_limit = 200;

// Grid
const background_color = '#777A89';
let grid_size = { x: 60, y: 30 };
let grid = [];
let grid_boundaries = { x: 0, y: 0, width: 0, height: 0 };

// Camera
let camera;
let inital_camera_zoom = 50.;

// User
let user = null;
let joined = false;

// Move
let dragging = false;
let show_drag = false;
let drag_from = { x: 0, y: 0 };
let drag_to = { x: 0, y: 0 };
let cell_from = null;
