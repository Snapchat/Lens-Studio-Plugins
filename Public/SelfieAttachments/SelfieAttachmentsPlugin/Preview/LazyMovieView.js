import * as Ui from 'LensStudio:Ui';

export class LazyMovieView extends Ui.Widget {
    constructor(parent) {
        super(parent);

        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);
        layout.setContentsMargins(0, 0, 0, 0);

        this.movieView = new Ui.MovieView(this);
        this.progress = new Ui.ProgressIndicator(this);

        layout.addWidgetWithStretch(this.movieView, 0, Ui.Alignment.AlignCenter);
        layout.addWidgetWithStretch(this.progress, 0, Ui.Alignment.AlignCenter);

        this.movieView.visible = false;
        this.progress.start();

        this.layout = layout;
    }

    set movie(movie) {
        if (movie) {
            this.progress.stop();
            this.movieView.movie = movie;
            this.progress.visible = false;
            this.movieView.visible = true;
        } else {
            this.progress.start();
            this.progress.visible = true;
            this.movieView.visible = false;
        }
    }

    get movie() {
        return this.movieView.movie;
    }

    set animated(animated) {
        this.movieView.animated = animated;
    }

    get animated() {
        return this.movieView.animated;
    }
}
