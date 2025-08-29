/**
 * Initializes scroll bar functionality for file tab bar.
 * @param {HTMLElement} navigationContainer Container element of bar and scroll
 * @param {HTMLElement} tabBarElement The tab bar element that will scroll.
 * @param {HTMLElement} scrollIndicatorElement The scroll bar element.
 */
function initializeTabScroller(navigationContainer, tabBarElement, scrollIndicatorElement) {
    if (!tabBarElement || !scrollIndicatorElement) {
        return {};
    }

    let isDragging = false;
    let latestMouseX = 0;
    let animationFrameId = null;
    let dragContext = {};

    const scrollUpdateLoop = () => {
        if (!isDragging) return;
        const { startX, startScrollLeft, scrollRatio, maxScrollLeft } = dragContext;
        const deltaX = latestMouseX - startX;
        const deltaScroll = deltaX * scrollRatio;
        tabBarElement.scrollLeft = Math.max(0, Math.min(maxScrollLeft, startScrollLeft + deltaScroll));

        animationFrameId = requestAnimationFrame(scrollUpdateLoop);
    };

    const updateScrollIndicator = () => {
        const hasOverflow = tabBarElement.scrollWidth > tabBarElement.clientWidth;
        if (hasOverflow) {
            scrollIndicatorElement.style.display = 'block';
            const visibleRatio = tabBarElement.clientWidth / tabBarElement.scrollWidth;
            const scrollPercent = tabBarElement.scrollLeft / (tabBarElement.scrollWidth - tabBarElement.clientWidth);
            scrollIndicatorElement.style.width = (visibleRatio * 100) + '%';
            const containerWidth = tabBarElement.clientWidth;
            const indicatorWidth = scrollIndicatorElement.offsetWidth;
            scrollIndicatorElement.style.left = (scrollPercent * (containerWidth - indicatorWidth)) + 'px';
        } else {
            scrollIndicatorElement.style.display = 'none';
        }
    };

    navigationContainer.addEventListener('wheel', (event) => {
        if (tabBarElement.scrollWidth <= tabBarElement.clientWidth) return;
        event.preventDefault();
        tabBarElement.scrollLeft += event.deltaY;
    });

    scrollIndicatorElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        document.body.classList.add('is-dragging-scrollbar');
        latestMouseX = e.clientX;

        dragContext = {
            startX: e.clientX,
            startScrollLeft: tabBarElement.scrollLeft,
            scrollRatio: tabBarElement.scrollWidth / tabBarElement.clientWidth,
            maxScrollLeft: tabBarElement.scrollWidth - tabBarElement.clientWidth
        };
        animationFrameId = requestAnimationFrame(scrollUpdateLoop);
    });

    window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        document.body.classList.remove('is-dragging-scrollbar');

        cancelAnimationFrame(animationFrameId);
        dragContext = {};
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        latestMouseX = e.clientX;
    });

    tabBarElement.addEventListener('scroll', updateScrollIndicator);
    navigationContainer.addEventListener('scroll', updateScrollIndicator);
    window.addEventListener('resize', updateScrollIndicator);

    const observer = new MutationObserver(updateScrollIndicator);
    observer.observe(tabBarElement, { childList: true });
    updateScrollIndicator();
}
function scrollTabIntoView(filePath) {
    const activeTabElement = document.querySelector(`.tab[title="${filePath}"]`);
    if (activeTabElement) {
        activeTabElement.scrollIntoView({
            behavior: 'smooth',
            inline: 'nearest'
        });
    }
}
