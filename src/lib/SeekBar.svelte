<script lang="ts">
    export let height: string;
    export let width: string;
</script>

<div class="wrapper" style={`--height:${height};--width:${width}`}>
</div>

<style>
    .wrapper {
        height: var(--height);
        width: var(--width);
        box-sizing: border-box;
        background-color: rgba(255, 255, 255, 0.5);
        border-radius: calc(var(--height) / 2);
        border-width: calc(var(--height) / 2);
        overflow: hidden;
    }
</style>
