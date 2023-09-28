// Fetch all items from the server and display them
function fetchItems() {
    fetch('http://localhost:5000/api/items/')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch items.');
        }
        return response.json();
    })
    .then(data => {
        const todoList = document.getElementById('todo-list');
        todoList.innerHTML = '';
        data.items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                ${item.name} 
                <button onclick="toggleDone(${item.id})">${item.done ? 'Mark as Undone' : 'Mark as Done'}</button>
                <button onclick="deleteItem(${item.id})">Delete</button>
            `;
            if (item.done) {
                listItem.classList.add('done');
            }
            todoList.appendChild(listItem);
        });
    })
    .catch(error => {
        console.error('Error fetching items:', error);
    });
}

// Mark an item as done/undone
function toggleDone(itemId) {
    fetch(`http://localhost:5000/api/items/${itemId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch item details.');
        }
        return response.json();
    })
    .then(data => {
        const item = data.item;
        return fetch(`http://localhost:5000/api/items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ done: !item.done })
        });
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update item status.');
        }
        fetchItems();
    })
    .catch(error => {
        console.error('Error toggling item:', error);
    });
}

// Delete an item
function deleteItem(itemId) {
    fetch(`http://localhost:5000/api/items/${itemId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete item.');
        }
        fetchItems();
    })
    .catch(error => {
        console.error('Error deleting item:', error);
    });
}

// Clear all items
document.getElementById('clear-all').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all items?')) {
        fetch('http://localhost:5000/api/items/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch items for deletion.');
            }
            return response.json();
        })
        .then(data => {
            const deletePromises = data.items.map(item => {
                return fetch(`http://localhost:5000/api/items/${item.id}`, { method: 'DELETE' });
            });
            return Promise.all(deletePromises);
        })
        .then(() => {
            fetchItems();
        })
        .catch(error => {
            console.error('Error clearing all items:', error);
        });
    }
});

// Add new item
document.getElementById('add-item-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const itemName = document.getElementById('item-name').value.trim();
    if (itemName) {
        fetch('http://localhost:5000/api/items/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: itemName })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add new item.');
            }
            fetchItems();
            document.getElementById('item-name').value = '';
        })
        .catch(error => {
            console.error('Error adding new item:', error);
        });
    }
});

// Fetch items initially
fetchItems();
