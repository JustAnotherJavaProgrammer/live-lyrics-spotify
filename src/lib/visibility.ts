export async function isVisible(element: Element): Promise<boolean> {
    return new Promise((res) => {
        const observer = new IntersectionObserver((entries) => {
            console.log("entries", entries);
            for (const entry of entries) {
                observer.unobserve(element);
                if (entry.target == element) {
                    observer.disconnect();
                    res(entry.isIntersecting);
                }
            }
        });
        observer.observe(element);
    });
}

export function isAnyVisible(elements: Element[]): Promise<boolean> {
    elements = elements.filter(e => e != null);
    return new Promise((res) => {
        const observer = new IntersectionObserver((entries) => {
            console.log("entries", entries);
            for (const entry of entries) {
                observer.unobserve(entry.target);
                elements.splice(elements.indexOf(entry.target), 1);
                if (entry.isIntersecting) {
                    observer.disconnect();
                    res(true);
                }
            }
            if (elements.length === 0) {
                res(false);
            }
        });
        for (const element of elements) {
            observer.observe(element);
        }
    });
}