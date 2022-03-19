function exit_button() {
    const exit_button = document.querySelector('.match_results .svg_button');
    const match_result_div = document.querySelector('.match_results_div');
    exit_button.addEventListener('click', e => {
        e.preventDefault();
        match_result_div.style.display = 'none';
    });
}
export function menus_events() {
    exit_button();
}
