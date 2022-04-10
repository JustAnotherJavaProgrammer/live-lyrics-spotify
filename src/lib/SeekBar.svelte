<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { clamp } from "./util";

    export let width: string;
    export let height: string;
    export let progress: number;

    const dispatch = createEventDispatcher();
    let knob: HTMLSpanElement = null;
    let bar: HTMLSpanElement = null;

    function dragChange(event: MouseEvent) {
        dispatch("dragChange", posToPercent(event.clientX));
    }

    function dragEnd(event: MouseEvent) {
        document.removeEventListener("mousemove", dragChange);
        document.removeEventListener("mouseup", dragEnd);
        knob.classList.remove("active");
        dispatch("dragEnd", posToPercent(event.clientX));
    }

    function startDrag(event: MouseEvent) {
        if (event.button != 0) {
            return;
        }
        document.addEventListener("mousemove", dragChange);
        document.addEventListener("mouseup", dragEnd);
        knob.classList.add("active");
        dispatch("dragStart", posToPercent(event.clientX));
    }

    function posToPercent(clientX: number) {
        const boundingRect = bar.getBoundingClientRect();
        return clamp(0, (clientX - boundingRect.left) / boundingRect.width, 1);
    }
</script>

<div class="wrapper" style={`--height:${height};--width:${width};--progress:${progress * 100}%;--p:${progress};`} on:mousedown={startDrag}>
    <span class="knob" bind:this={knob} />
    <span class="bar" bind:this={bar}>
        <span class="progress" />
    </span>
</div>

<style>
    .wrapper {
        padding: calc(1.5 * var(--height));
        height: var(--height);
    }

    .bar {
        display: inline-block;
        height: var(--height);
        width: var(--width);
        box-sizing: content-box;
        background-color: rgba(255, 255, 255, 0.5);
        border-radius: calc(var(--height) / 2);
        /* border-width: calc(var(--height) / 2); */
        overflow: hidden;
        vertical-align: top;
    }

    .progress {
        display: inline-block;
        width: 100%;
        height: 100%;
        background-color: white;
        vertical-align: top;
        transform: translateX(calc(-100% + var(--progress)));
    }

    .knob {
        display: inline-block;
        position: absolute;
        background-color: white;
        width: calc(2 * var(--height));
        height: calc(2 * var(--height));
        border-radius: var(--height);
        vertical-align: middle;
        transform: translate(calc(-1 * var(--height) + var(--p) * var(--width)), calc(-0.5 * var(--height)));
        /* transition: border-radius, transform, width, height 0.2s; This transition looks cursed, do not use. */
    }

    .knob:hover,
    .wrapper:hover > .knob,
    .knob:global(.active) {
        border-radius: calc(var(--height) * 1.25);
        width: calc(2.5 * var(--height));
        height: calc(2.5 * var(--height));
        transform: translate(calc(-1.25 * var(--height) + var(--p) * var(--width)), calc(-0.75 * var(--height)));
    }
</style>
