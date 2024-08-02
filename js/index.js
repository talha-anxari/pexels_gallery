const dropdownContent = document.querySelector(".dropDown_content");
const dropDownSelectorValue = document.getElementById("dropdownSelectedValue");
const dropDown = document.getElementById("dropDown"),
  searchText = document.getElementById("searchText"),
  searchClick = document.querySelector(".bx-search"),
  items = document.querySelector(".items"),
  loadMore = document.querySelector(".loadMore"),
  totalResults = document.getElementById("totalResults"),
  popupView = document.querySelector('.popupView');

let page = 1,
  perPage = 15,
  searchItem = "Picture";

dropdownContent.addEventListener("click", (e) => {
  dropDownSelectorValue.textContent = e.target.textContent.trim();
  dropDown.checked = false;
  searchItem = e.target.textContent.trim();

  loadMore.style.display = "none";
  items.innerHTML = "";
  totalResults.innerText = 0;

  // Update placeholder based on selected item
  if (searchItem.toLowerCase() === "picture") {
      searchText.placeholder = "Search for pictures...";
  } else if (searchItem.toLowerCase() === "video") {
      searchText.placeholder = "Search for videos...";
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Initial setup
  loadMore.style.display = "none";
  searchText.value = "nature";
  searchText.placeholder = "Search for pictures..."; // Default placeholder

  // Event listener for search click
  searchClick.addEventListener("click", () => {
      generateAPIResponse(searchItem);
  });

  // Rest of your code...
});

searchText.addEventListener("keydown", function (event) {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevent form submission or other default actions
    generateAPIResponse(searchItem, true); // Trigger search with current item and reset page
  }
});


function generateAPIResponse(searchItem, isLoadMore) {
  if (isLoadMore) {
    page = 1;
    items.innerHTML = '';
  } else {
    page++;
  }
  
  const apiKey = "3JTV4bqlwZxql4FNuzDTwJB6M8WzmhBFNZCjRonaV1eJEMy0EbL5Sa27";
  let apiUrl = `https://api.pexels.com/v1/search?query=${searchText.value}&page=${page}&per_page=${perPage}`;

  if (searchItem === "Video") {
    apiUrl = `https://api.pexels.com/videos/search?query=${searchText.value}&page=${page}&per_page=${perPage}`;
  }

  fetch(apiUrl, {
    headers: {
      Authorization: apiKey,
    },
  })
  .then((response) => response.json())
  .then((data) => {
    console.log(data);

    totalResults.innerText = data.total_results;

    if (data.total_results === 0 || data.status === 400) {
      items.innerHTML = `
        <div class='notFound'>
          <i class='bx bx-sad'></i>
          <h1>${searchText.value}</h1>
          <h3>Sorry, no results found</h3>
          <br>
          <h2>Try Another Search Items</h2>
        </div>
      `;
      loadMore.style.display = 'none';
      items.style.columns = 'auto'
      return;
    }
    items.style.columns = '5 340px'
    if(document.querySelector('.notFound')){
      document.querySelector('.notFound').remove();
    }
    // Displaying loaded items based on searchItem type
    if (searchItem === "Picture" && data.photos !== undefined) {
      data.photos.forEach((photo) => {
        generateImageItems(photo);
      });
    } else if (searchItem === "Video" && data.videos !== undefined) {
      data.videos.forEach((video) => {
        generateVideosItems(video);
      });
    }

    // Toggle 'Load More' button visibility
    if (data.next_page !== null) {
      loadMore.style.display = 'block';
    } else {
      loadMore.style.display = 'none';
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

// Function to generate image items
const generateImageItems = (item) => {
  let div = document.createElement("div");
  div.classList.add("card");

  let img = new Image();
  img.onload = function () {
    div.appendChild(this);
    items.appendChild(div);
  };

  img.src = item.src.original;
  img.alt = item.alt;
  img.classList.add("img");

  // Click handler to show popup view
  img.addEventListener('click', () => {
    showPopupView('image', item.src.original, item.photographer);
  });

  div.innerHTML += `
    <div class='details'>
      <div class='photographer'>
        <i class='bx bx-camera'></i>
        <span>${item.photographer}</span>
      </div>
      <button onclick="downloadFile('image', '${item.src.original}')">
        <i class='bx bxs-download'></i>
      </button>
    </div>
  `;
};

// Function to show popup view
const showPopupView = (type, element, name) => {
  let content = '';

  if (type === 'image') {
    content = `<img src='${element}'/>`;
  } else if (type === 'video') {
    content = `<video src='${element}' autoplay loop></video>`;
  }

  popupView.querySelector('.previewItem').innerHTML = `
    <div class='elementItem'>
      ${content}
    </div>
  `;
  
  // Set download button attributes
  document.getElementById('setDownloadAttr').setAttribute('data-type', type);
  document.getElementById('setDownloadAttr').setAttribute('data-file', element);
  popupView.querySelector('span').innerText = name;
  popupView.classList.add('show');
  document.body.style.overflow = 'hidden';
};

// Function to hide popup view
const hidePopupView = () => {
  popupView.classList.remove('show');
  document.body.style.overflow = 'auto';
};

// Event listener for download click in popup view
document.getElementById('downloadClick').addEventListener('click', (e) => {
  downloadFile(e.target.getAttribute('data-type'), e.target.getAttribute('data-file'));
});

// Event listener for Load More button
loadMore.addEventListener('click', () => {
  generateAPIResponse(searchItem, false);
});
// Function to handle file download
function downloadFile(type, fileUrl) {
  if (type === 'image') {
    fetch(fileUrl)
    .then((res) => res.blob())
    .then((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = new Date().getTime();
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  } else {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = 'download.mp4';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}

const generateVideosItems = (item) => {
  let div = document.createElement("div");
  div.classList.add("card");


  let videoEle = document.createElement("video");
  videoEle.src = item.video_files[0].link; // Assuming video link is at index 0

  // Set attributes for video element
  videoEle.autoplay = false; // Autoplay off by default
  videoEle.loop = true; // Loop the video
  videoEle.controls = false; // Hide controls
  videoEle.classList.add("video"); // Add 'video' class for styling

  // Event listeners for video playback
  videoEle.addEventListener('mouseenter', () => {
    videoEle.play();
  });
  videoEle.addEventListener('mouseleave', () => {
    videoEle.pause();
  });

  // Open popup view on div click
  div.addEventListener('click', () => {
    showPopupView('video', item.video_files[0].link, item.user.name);
  });

  // Append video element to card div
  div.appendChild(videoEle);

  // Append card div to items container
  items.appendChild(div);
};


loadMore.addEventListener('click', () => {
  generateAPIResponse(searchItem, false);
});