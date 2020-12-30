// Global Variable - Records the timer ID we are up to
// Gets incremented each time a new ingame time is added
document.timers = 0;

// addGameTimer(): void
// Adds a new game timer row to the form, is triggered
// when the 'add new' button is clicked on the game timer form.
// Increments the document.timers variable.
function addGameTimer()
{
	// Dereference the Game Timer table
	let gametimer = document.getElementById('game-timer');
	
	// Create a new table row element
	let tr = document.createElement('tr');
	
	// Increment the number of items in the game timers table
	document.timers++;
	
	// Set the id for the game timer table row to game-timer-(current row)
	tr.id = 'game-timer-' + document.timers;
	
	
	tr.innerHTML = "<td><form class='form-group'>" + 
				   "<input type='number' class='form-control' id='game-min-" + document.timers + 
				   "' value=0 min=0 onChange='updateIngameTime()'</td>" + 
				   "<td><form class='form-group'>" + 
				   "<input type='number' class='form-control' id='game-sec-" + document.timers + 
				   "' value=0 min=0 onChange='updateIngameTime()'</td>" + 
				   "<td><form class='form-group'>" + 
				   "<input type='number' class='form-control' id='game-ms-" + document.timers + 
				   "' value=0 min=0 onChange='updateIngameTime()'</td>" + 
				   "<td><form class='form-group'>" + 
				   "<button type='button' class='btn btn-danger' onclick='" + 
				   'rmvGameTimer("game-timer-' + document.timers + '")' + "'> Remove </button></td>";
				   
	// Add the new row to the parent table
	gametimer.appendChild(tr);
}

// rmvGameTimer(id: string): void
// Removes the element (game timer row) from the form
// which is provided as an argument. Can be used to 
// delete other objects, however this function is purely
// intended to delete rows from the 'game timer' table.
function rmvGameTimer(id)
{
	console.log(id);
	
	// Get the row from the table using the provided id
	tr = document.getElementById(id);
	
	// Remove the item from the page
	tr.remove();
	
	// Update ingame time table
	updateIngameTime();
}

// updateIngameTime(): void
function updateIngameTime()
{
	// getGameTimeObject(): object
	// Generates a list containing all of the 
	// times provided in the game timer table
	// Format: [[min,sec,ms],...]
	function getGameTimeObject()
	{
		// Table which will be returned
		let table = [];
		
		// Iterate over all of the elements which start with 'game-timer-'
		$('tr[id^="game-timer-"]').each(function(index, element){
			
			// Split the number off the end of the id string
			let id = element.id;
			
			// Get the last element of the id, which should be the number
			let number = id.split('-').pop();
			
			// Create the list which will store the row elements
			let row = [];
			
			// Retrieve the minutes, seconds, and milliseconds for the row
			// and append them to the row list
			row.push(parseInt(document.getElementById('game-min-' + number).value));
			row.push(parseInt(document.getElementById('game-sec-' + number).value));
			row.push(parseInt(document.getElementById('game-ms-' + number).value));
			
			// Append the row to the table
			table.push(row);
		});
		
		// Return the table to the calling process
		return table;
	}

	// getBonusTimeObject(): object
	// Returns a list containing the 
	// minutes, seconds and ms in the 
	// bonus round table
	// Format: [min,sec,ms]
	function getBonusTimeObject()
	{
		// Table which will be returned
		let table = [];
		
		// Retrieve the minutes, seconds, and milliseconds for the bonus time
		// and append them to the bonus time list
		table.push(parseInt(document.getElementById('bonus-min').value));
		table.push(parseInt(document.getElementById('bonus-sec').value));
		table.push(parseInt(document.getElementById('bonus-ms').value));
		
		// Return the table to the calling process
		return table;
	}
	
	// getIngameTimeObject(): object
	// Returns a list containing the total
	// minutes, seconds and milliseconds 
	// in the combined game time and bonus
	// round time tables.
	// Format: [min,sec,ms]
	function getTotalTimeObject(game,bonus)
	{
		// Table which will be returned
		let table = [];
		
		// Sum of all of the game time
		let gsum = [0,0,0];
		
		// Iterate over game object array
		for(let g=0; g<game.length; g++)
		{
			// Add the min, sec and ms from
			// the current row to their respective
			// column in the game time sum array
			gsum[0] += game[g][0];
			gsum[1] += game[g][1];
			gsum[2] += game[g][2];
		}
		
		// If the minutes sum is greater than 0, 
		// Set the base to 300 (1 * 5 * 60)
		// Otherwise, set the base to 0 (0 * 5 * 60)
		let base = gsum[0] ? game.length * 300: 0;
		
		// Deduct the game timer from the base time generated
		base -= (gsum[0]*60) + gsum[1] + (gsum[2]/100)
		
		// Add the bonus time to the base time generated
		base += (bonus[0]*60) + bonus[1] + (bonus[2]/100)
		
		table.push(Math.floor(base / 60));
		table.push(Math.floor(base % 60));
		table.push(Math.floor(100 * (base % 1)));

		// Return the table to the calling process
		return table;
	}
	
	// Generate the game time table list
	let game = getGameTimeObject();
	
	// Generate the bonus time table
	let bonus = getBonusTimeObject();
	
	// Generate the total time table, using the existing game and bonus tables
	let total = getTotalTimeObject(game,bonus);
	
	// Update the total minutes, seconds and milliseconds on the total table
	document.getElementById('total-min').innerHTML = total[0];
	document.getElementById('total-sec').innerHTML = total[1];
	document.getElementById('total-ms').innerHTML = total[2];
}

// Wait until the document has been loaded fully
$(document).ready(function(){
	
	// Add the click event listener to the 'clipboard' button element
	// When this event is triggered, the minutes, seconds and milliseconds
	// in the total table will be copied to the user's clipboard in the format
	// min : sec : ms
	
	document.getElementById('clipboard').addEventListener('click', async event => {
		
		// If the clipboard module exists in the client's browser
		if(navigator.clipboard)
		{
			// Retrieve the total minutes, seconds and milliseconds from the form
			let min = document.getElementById('total-min').innerHTML;
			let sec = document.getElementById('total-sec').innerHTML;
			let ms = document.getElementById('total-ms').innerHTML;
			
			// Combine the minutes, seconds and milliseconds into a single string
			let copy = min + ':' + sec + ':' + ms;
			
			try
			{
				// Copy the string to the clipboard
				await navigator.clipboard.writeText(copy);
				
				console.log('Content "' + copy + '" copied to clipboard!');
			}
			catch (err)
			{
				// Report the failure to the error console
				console.error('Failed to copy content "' + copy + '"! Reason: "' + err + '"');
			}
		}
		else // Clipboard module is not available
		{
			// Report failure to console, continue
			console.error('Clipboard interaction not supported by browser.');
		}
	});
});