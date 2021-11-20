// A class that represents a cell of the grid
class Cell
{
	// Contruct a cell
	constructor(color, user_id, nb_troops)
	{
		this.color = color;
		this.user_id = user_id;
		this.nb_troops = nb_troops;
	}
}

module.exports = Cell;
