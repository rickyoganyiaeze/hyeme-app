export const initExplore = () => {
    const gridItems = document.querySelectorAll('.explore-item');
    gridItems.forEach(item => {
        item.addEventListener('click', () => alert("Open Status"));
    });
};