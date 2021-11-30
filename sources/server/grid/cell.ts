export type Change = {
	i: number,
	j: number,
	color: string,
	user_id: string,
	nb_troops: number
};

// A class that represents a cell of the grid
export class Cell
{
	color: string;
	user_id: string;
	nb_troops: number;

	// Contruct a cell
	constructor(color: string, user_id: string, nb_troops: number)
	{
		this.color = color;
		this.user_id = user_id;
		this.nb_troops = nb_troops;
	}
}
