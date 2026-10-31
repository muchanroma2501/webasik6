/* Assignment 6: jQuery interactions for City Zoo. */
(function ($) {
    'use strict';

    if (!$) return;

    $(document).ready(function () {
        console.log('jQuery is ready!');

        var $body = $('body');
        var $progress = $('<div class="scroll-progress" aria-hidden="true"><span></span></div>');
        var $toast = $('<div class="zoo-toast" role="status" aria-live="polite"></div>');
        $body.prepend($progress).append($toast);

        function updateProgress() {
            var scrollable = $(document).height() - $(window).height();
            var percent = scrollable > 0 ? ($(window).scrollTop() / scrollable) * 100 : 0;
            $progress.find('span').css('width', Math.min(100, Math.max(0, percent)) + '%');
        }
        $(window).on('scroll.jqueryAssignment resize.jqueryAssignment', updateProgress);
        updateProgress();

        var toastTimer;
        function showToast(message) {
            window.clearTimeout(toastTimer);
            $toast.stop(true, true).text(message).addClass('is-visible');
            toastTimer = window.setTimeout(function () {
                $toast.removeClass('is-visible');
            }, 2600);
        }
        window.ZooToast = showToast;

        // Reuse the existing animal search. Other pages receive the same search UI.
        var $search = $('#animal-search');
        var isAnimalSearch = $search.length > 0;
        if (!isAnimalSearch && $('#main').length) {
            var searchMarkup = '<section class="zoo-search mb-4" aria-label="Search City Zoo content">' +
                '<label class="form-label fw-semibold" for="zoo-search-input">Explore the zoo</label>' +
                '<div class="zoo-search-wrap"><input class="form-control" id="zoo-search-input" type="search" autocomplete="off" placeholder="Search animals, experiences, or FAQs…" aria-autocomplete="list" aria-controls="zoo-search-suggestions">' +
                '<ul class="zoo-search-suggestions" id="zoo-search-suggestions" role="listbox" hidden></ul></div>' +
                '<p class="small text-body-secondary mt-2 mb-0" id="zoo-search-status" aria-live="polite">Search this page as you type.</p></section>';
            var $hero = $('#main').children('.hero-card').first();
            var $firstHeading = $('#main').find('h1').first();
            if ($hero.length) $hero.after(searchMarkup);
            else if ($firstHeading.length) $firstHeading.parent().after(searchMarkup);
            else $('#main').prepend(searchMarkup);
            $search = $('#zoo-search-input');
        } else if (isAnimalSearch) {
            $search.attr({ 'aria-autocomplete': 'list', 'aria-controls': 'animal-search-suggestions' });
            $('<ul class="zoo-search-suggestions" id="animal-search-suggestions" role="listbox" hidden></ul>').insertAfter($search);
        }

        if ($search.length) {
            var $suggestions = $search.siblings('.zoo-search-suggestions');
            var $status = isAnimalSearch ? $('#animal-count') : $('#zoo-search-status');
            var $targets = isAnimalSearch ? $('.animal-col') : $('#main').find('.card-zoo, .faq-item, .why-visit-card, .list-group-item, article');
            var originals = new Map();
            $targets.each(function () { originals.set(this, $(this).html()); });

            function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
            function applySearch() {
                var query = String($search.val() || '').trim();
                var normalized = query.toLocaleLowerCase();
                var matched = 0;
                var pattern = query ? new RegExp('(' + escapeRegExp(query) + ')', 'ig') : null;

                $targets.each(function () {
                    var $item = $(this);
                    var text = isAnimalSearch ? $item.find('.card-title').text() : (originals.get(this) || '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
                    var isMatch = !normalized || text.toLocaleLowerCase().indexOf(normalized) !== -1;
                    $item.toggle(isMatch);
                    if (isMatch) matched++;
                    var originalHtml = originals.get(this) || '';
                    var highlightedHtml = pattern ? originalHtml.split(/(<[^>]+>)/g).map(function (part) {
                        return part.charAt(0) === '<' ? part : part.replace(pattern, '<mark class="search-highlight">$1</mark>');
                    }).join('') : originalHtml;
                    $item.html(highlightedHtml);
                });

                if (isAnimalSearch) $status.text('Showing ' + matched + ' of ' + $targets.length + ' animals' + (query && matched === 0 ? '. Try another name.' : ''));
                else if (query) $status.text(matched ? matched + ' matching result' + (matched === 1 ? '' : 's') : 'No matching results. Try another keyword.');
                else $status.text('Search this page as you type.');

                var names = [];
                $targets.each(function () {
                    if ($(this).is(':visible')) {
                        var title = $(this).find('.card-title, .faq-question span:first-child, h2, h3').first().text().trim();
                        if (title && names.indexOf(title) < 0) names.push(title);
                    }
                });
                var matches = normalized ? names.filter(function (name) { return name.toLocaleLowerCase().indexOf(normalized) >= 0; }).slice(0, 6) : [];
                $suggestions.empty();
                matches.forEach(function (name, index) {
                    $('<li role="option"></li>').append($('<button type="button" class="zoo-suggestion"></button>').text(name).attr('data-index', index)).appendTo($suggestions);
                });
                $suggestions.prop('hidden', matches.length === 0);
            }

            $search.on('input.jqueryAssignment keyup.jqueryAssignment', applySearch);
            $suggestions.on('click', '.zoo-suggestion', function () {
                $search.val($(this).text());
                $suggestions.prop('hidden', true);
                applySearch();
            });
            $search.on('keydown.jqueryAssignment', function (event) {
                if (event.key === 'Escape') $suggestions.prop('hidden', true);
                if (event.key === 'ArrowDown' && !$suggestions.prop('hidden')) {
                    event.preventDefault();
                    $suggestions.find('button').first().trigger('focus');
                }
            });
            $suggestions.on('keydown.jqueryAssignment', 'button', function (event) {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); $(this).trigger('click'); }
                if (event.key === 'Escape') { $suggestions.prop('hidden', true); $search.trigger('focus'); }
            });
            applySearch();
        }

        // Animate statistic values once when the stats enter the viewport.
        $('[data-counter]').each(function () {
            var $counter = $(this);
            var target = Number($counter.attr('data-counter')) || 0;
            var suffix = $counter.attr('data-counter-suffix') || '';
            var started = false;
            var observer = new IntersectionObserver(function (entries) {
                if (!entries[0].isIntersecting || started) return;
                started = true;
                $({ value: 0 }).animate({ value: target }, {
                    duration: 1400,
                    easing: 'swing',
                    step: function () { $counter.text(Math.floor(this.value).toLocaleString() + suffix); },
                    complete: function () { $counter.text(target.toLocaleString() + suffix); }
                });
                observer.disconnect();
            }, { threshold: 0.35 });
            observer.observe(this);
        });

        // Called only after the site's existing validation accepts the form.
        window.ZooSubmitFeedback = function (form, onComplete) {
            var $form = $(form);
            var $button = $form.find('[type="submit"]').first();
            if (!$button.length || $button.prop('disabled')) return;
            var label = $button.html();
            $button.prop('disabled', true).attr('aria-busy', 'true').html('<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Please wait…');
            window.setTimeout(function () {
                $button.prop('disabled', false).removeAttr('aria-busy').html(label);
                if (typeof onComplete === 'function') onComplete();
                else showToast('Form submitted successfully!');
            }, 1400);
        };

        // Copy the chosen text and confirm the action with a checkmark and toast.
        $(document).on('click.jqueryAssignment', '[data-copy-target]', function () {
            var $button = $(this);
            var target = document.getElementById($button.attr('data-copy-target'));
            if (!target) return;
            var value = target.innerText.trim();
            function copied() {
                var old = $button.html();
                $button.html('<span aria-hidden="true">✓</span> Copied!').addClass('is-copied');
                showToast('Copied to clipboard!');
                window.setTimeout(function () { $button.html(old).removeClass('is-copied'); }, 2000);
            }
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(value).then(copied).catch(function () { fallbackCopy(value, copied); });
            } else fallbackCopy(value, copied);
        });
        function fallbackCopy(value, done) {
            var $temporary = $('<textarea>').val(value).css({ position: 'fixed', opacity: 0 }).appendTo('body').trigger('focus').trigger('select');
            try { if (document.execCommand('copy')) done(); else showToast('Clipboard access is unavailable in this browser.'); }
            catch (error) { showToast('Clipboard access is unavailable in this browser.'); }
            $temporary.remove();
        }

        // Defer remote images until they are close to the viewport.
        var imageObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var image = entry.target;
                var $image = $(image);
                var source = $image.attr('data-src');
                if (source) {
                    $image.attr('src', source).removeAttr('data-src');
                    image.addEventListener('load', function () { $image.addClass('is-loaded'); }, { once: true });
                }
                observer.unobserve(image);
            });
        }, { rootMargin: '250px 0px' });
        $('img[src]').each(function () {
            var $image = $(this);
            var source = $image.attr('src');
            if (!/^data:/i.test(source) && !$image.attr('data-src')) {
                $image.attr('data-src', source).attr('src', 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=').attr('loading', 'lazy');
                imageObserver.observe(this);
            }
        });
    });
})(window.jQuery);

