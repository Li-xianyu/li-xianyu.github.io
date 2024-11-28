function debounce(func, wait) {
    let timeout;
    let isFirstCall = true; // 标志是否是第一次调用

    return function (...args) {
        if (isFirstCall) {
            func(...args); // 第一次点击立即执行
            isFirstCall = false; // 标记为已执行过
        } else {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        }
    };
}


const tip = {
    bottomPopup(txt, options = {}) {
        const {
            fadeDuration = 300,
            displayDuration = 1500,
            backgroundColor = "rgba(0, 0, 0, 0.8)",
            textColor = "white",
            borderRadius = "4px",
        } = options;

        if (txt.length > 20) return false;

        const popup = document.createElement("div");
        popup.textContent = txt;

        Object.assign(popup.style, {
            position: "fixed",
            left: "50%",
            bottom: "100px",
            transform: "translateX(-50%) scale(0.8)",
            backgroundColor,
            color: textColor,
            padding: "10px 15px",
            borderRadius,
            textAlign: txt.length <= 20 ? "center" : "left",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            zIndex: 9999,
            opacity: 0,
            transition: `opacity ${fadeDuration}ms ease, transform ${fadeDuration}ms ease`,
        });

        document.body.appendChild(popup);

        setTimeout(() => {
            popup.style.opacity = 1;
            popup.style.transform = "translateX(-50%) scale(1)";
        }, 10);

        setTimeout(() => {
            popup.style.opacity = 0;
            popup.style.transform = "translateX(-50%) scale(0.8)";
            setTimeout(() => popup.remove(), fadeDuration);
        }, displayDuration + fadeDuration);
    },

    topBar(txt, options = {}) {
        const {
            slideDuration = 300,
            displayDuration = 2000,
            backgroundColor = "rgba(0, 0, 0, 0.9)",
            textColor = "white",
        } = options;

        const bar = document.createElement("div");
        bar.textContent = txt;

        Object.assign(bar.style, {
            width: "100%",
            position: "fixed",
            top: "-100px",
            left: "0",
            backgroundColor,
            color: textColor,
            lineHeight: "1.5",
            padding: "10px 20px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
            fontSize: "16px",
            zIndex: 9999,
            transition: `top ${slideDuration}ms ease-in-out`,
        });

        document.body.appendChild(bar);

        setTimeout(() => {
            bar.style.top = "0";
        }, 10);

        setTimeout(() => {
            bar.style.top = `-${bar.offsetHeight}px`;
            setTimeout(() => bar.remove(), slideDuration);
        }, displayDuration + slideDuration);
    },
};
