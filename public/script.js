$(document).ready(function() {
    var searchInput = $("#searchInput");
    var dropdownList = $("#dropdownList");
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func(...args);
            }, delay);
        };
    };

    // Function to handle the debounced input event
    const handleDebouncedInput = async function () {
        const searchTerm = searchInput.val().trim();
        console.log("Search Term: ", searchTerm);

        try {
            const searchData = await fetchData(searchTerm);
            console.log("Searched Books: ", searchData);
            // Update the dropdown list
            await updateDropdown(searchData, dropdownList);
        } catch (error) {
            console.error('Error updating dropdown:', error);
        }
    };

    searchInput.on('input', debounce(handleDebouncedInput,500));



});

async function fetchData(searchTerm) {
    try {
        const response = await axios.get(`https://openlibrary.org/search.json?q=${searchTerm}&fields=title,author_name,first_publish_year,cover_i&limit=8`);
        const docs = response.data.docs;

        const searchData = docs.map(doc => {
            const title = doc.title ? doc.title : "N/A";
            const publishYear = doc.first_publish_year ? doc.first_publish_year : "N/A";
            const coverId = doc.cover_i ? doc.cover_i : "N/A";
            const authorName = doc.author_name ? doc.author_name[0] : "N/A";

            return {
                title: title,
                publishYear: publishYear,
                coverId: coverId,
                authorName: authorName,
            };
        });

        console.log(searchData);
        return searchData;
    } catch (error) {
        console.error("Error fetching data: ", error);
        // Return an empty array or handle the error as needed
        return [];
    }
}

async function updateDropdown(items, dropdownList) {
    const html = items.map(item =>
        `<a href="/book?title=${item.title}&author=${item.authorName}&coverId=${item.coverId ? item.coverId : 0}">
            <li class="listItem">
                <div class="d-flex align-items-center">
                    <img class="align-self-center" src="https://covers.openlibrary.org/b/id/${item.coverId}-S.jpg?default=https://openlibrary.org/static/images/icons/avatar_book-sm.png" width="40" height="60" alt="book picture">
                    <div class="d-block">
                        <p><strong>${item.title}</strong></p>
                        <p>By ${item.authorName}, ${item.publishYear}</p>
                    </div>
                </div>
            </li>
        </a>`
    ).join('');
    dropdownList.html(html);

    // Show/hide dropdown
    if (items.length > 0) {
        dropdownList.show();
    } else {
        dropdownList.hide();
    }
}

const rangeInput = $('#rating');
const bookRating = $('#bookRating');
rangeInput.on('input', function() {
    bookRating.html(`Given rating: ${this.value}`);
});
function openEditing(id) {
    document.getElementById("editButton" + id).setAttribute("hidden", true)
    document.getElementById("review" + id).setAttribute("hidden", true)
    document.getElementById("editReview" + id).removeAttribute("hidden")
    document.getElementById("checkButton" + id).removeAttribute("hidden")
    document.getElementById("cancelReview" + id).removeAttribute("hidden")
  }
function closeEditing(id) {
    document.getElementById("editButton" + id).removeAttribute("hidden")
    document.getElementById("review" + id).removeAttribute("hidden")
    document.getElementById("editReview" + id).setAttribute("hidden",true)
    document.getElementById("checkButton" + id).setAttribute("hidden",true)
    document.getElementById("cancelReview" + id).setAttribute("hidden",true)
}