{*
* FeWo rate option selector
*}
{if $lang_iso == 'de'}
    {assign var=rate_label value='Reisepräferenz'}
    {assign var=rate_flex_title value='Flexible Buchung'}
    {assign var=rate_flex_note value='Ideal, wenn sich Pläne ändern können.'}
    {assign var=rate_nonref_title value='Sparbuchung'}
    {assign var=rate_nonref_note value='Bester Preis mit reduzierter Flexibilität.'}
    {assign var=rate_help value='Das Angebot passt sich automatisch an Aufenthaltsdauer und Gästeanzahl an.'}
    {assign var=guest_label value='Reiseprofil'}
    {assign var=guest_chargeable_label value='Gaeste ab 3 Jahren'}
    {assign var=guest_under3_label value='Kinder unter 3 Jahren'}
    {assign var=guest_help value='Der Preis wird automatisch nach Aufenthaltsdauer und Reiseprofil berechnet.'}
    {assign var=special_request_label value='Besondere Wuensche'}
    {assign var=special_request_placeholder value='z. B. Babybett, Hochstuhl oder Anreisehinweise'}
    {assign var=special_request_help value='Unter 3 Jahre frei. Schreiben Sie hier zusaetzliche Wuensche.'}
{elseif $lang_iso == 'fr'}
    {assign var=rate_label value='Preference de sejour'}
    {assign var=rate_flex_title value='Reservation flexible'}
    {assign var=rate_flex_note value='Ideal si vos plans peuvent changer.'}
    {assign var=rate_nonref_title value='Reservation economique'}
    {assign var=rate_nonref_note value='Meilleur prix avec flexibilite reduite.'}
    {assign var=rate_help value='L\'offre s\'adapte automatiquement a la duree du sejour et au nombre de voyageurs.'}
    {assign var=guest_label value='Profil de voyage'}
    {assign var=guest_chargeable_label value='Voyageurs de 3 ans et plus'}
    {assign var=guest_under3_label value='Enfants de moins de 3 ans'}
    {assign var=guest_help value='Le tarif s\'ajuste automatiquement selon la duree du sejour et votre profil.'}
    {assign var=special_request_label value='Demande speciale'}
    {assign var=special_request_placeholder value='ex. lit bebe, chaise haute, heure d\'arrivee'}
    {assign var=special_request_help value='Les enfants de moins de 3 ans sont gratuits. Ajoutez ici vos demandes.'}
{elseif $lang_iso == 'es'}
    {assign var=rate_label value='Preferencia de reserva'}
    {assign var=rate_flex_title value='Reserva flexible'}
    {assign var=rate_flex_note value='Ideal si sus planes pueden cambiar.'}
    {assign var=rate_nonref_title value='Reserva ahorro'}
    {assign var=rate_nonref_note value='Mejor precio con flexibilidad reducida.'}
    {assign var=rate_help value='La oferta se ajusta automaticamente a la duracion de la estancia y al numero de huespedes.'}
    {assign var=guest_label value='Perfil de viaje'}
    {assign var=guest_chargeable_label value='Viajeros de 3+ anos'}
    {assign var=guest_under3_label value='Ninos menores de 3 anos'}
    {assign var=guest_help value='El precio se ajusta automaticamente segun la duracion y el perfil de viaje.'}
    {assign var=special_request_label value='Solicitud especial'}
    {assign var=special_request_placeholder value='p. ej. cuna, silla para bebe, hora de llegada'}
    {assign var=special_request_help value='Ninos menores de 3 anos gratis. Escriba aqui peticiones adicionales.'}
{else}
    {assign var=rate_label value='Stay preference'}
    {assign var=rate_flex_title value='Flexible booking'}
    {assign var=rate_flex_note value='Best for plans that might change.'}
    {assign var=rate_nonref_title value='Saver booking'}
    {assign var=rate_nonref_note value='Best available price with reduced flexibility.'}
    {assign var=rate_help value='Your offer adapts automatically to stay length and guest details.'}
    {assign var=guest_label value='Travel profile'}
    {assign var=guest_chargeable_label value='Guests aged 3+'}
    {assign var=guest_under3_label value='Children under 3'}
    {assign var=guest_help value='Pricing adapts automatically to your stay length and travel profile.'}
    {assign var=special_request_label value='Special request'}
    {assign var=special_request_placeholder value='e.g. baby bed, baby chair, arrival notes'}
    {assign var=special_request_help value='Kids under 3 stay free. Add any extra request here.'}
{/if}
<div class="row fewo-rate-row">
    <div class="form-group col-sm-12">
        <label class="control-label">{$rate_label|escape:'html':'UTF-8'}</label>
        <div class="fewo-rate-options">
            <label class="fewo-rate-option">
                <input type="radio" name="fewo_rate_option" value="standard" {if $fewo_rate_selected == 'standard'}checked="checked"{/if}>
                <span class="fewo-rate-copy">
                    <span class="fewo-rate-title">{$rate_flex_title|escape:'html':'UTF-8'}</span>
                    <span class="fewo-rate-note">{$rate_flex_note|escape:'html':'UTF-8'}</span>
                </span>
            </label>
            <label class="fewo-rate-option">
                <input type="radio" name="fewo_rate_option" value="nonref" {if $fewo_rate_selected == 'nonref'}checked="checked"{/if}>
                <span class="fewo-rate-copy">
                    <span class="fewo-rate-title">{$rate_nonref_title|escape:'html':'UTF-8'}</span>
                    <span class="fewo-rate-note">{$rate_nonref_note|escape:'html':'UTF-8'}</span>
                </span>
            </label>
        </div>
        <p class="help-block fewo-rate-help">{$rate_help|escape:'html':'UTF-8'}</p>

        <input type="hidden" name="fewo_guest_profile_enabled" value="1">
        <label class="control-label fewo-guest-label">{$guest_label|escape:'html':'UTF-8'}</label>
        <div class="fewo-guest-fields">
            <div class="fewo-guest-field">
                <label for="fewo_chargeable_guests">{$guest_chargeable_label|escape:'html':'UTF-8'}</label>
                <select
                    id="fewo_chargeable_guests"
                    name="fewo_chargeable_guests"
                    class="form-control fewo-guest-select">
                    {for $guest_count=1 to 4}
                        <option value="{$guest_count|intval}" {if $fewo_guest_chargeable_selected == $guest_count}selected="selected"{/if}>
                            {$guest_count|intval}
                        </option>
                    {/for}
                </select>
            </div>
            <div class="fewo-guest-field">
                <label for="fewo_under3_guests">{$guest_under3_label|escape:'html':'UTF-8'}</label>
                <select
                    id="fewo_under3_guests"
                    name="fewo_under3_guests"
                    class="form-control fewo-guest-select">
                    {for $guest_under3=0 to 4}
                        <option value="{$guest_under3|intval}" {if $fewo_guest_under3_selected == $guest_under3}selected="selected"{/if}>
                            {$guest_under3|intval}
                        </option>
                    {/for}
                </select>
            </div>
        </div>
        <p class="help-block fewo-rate-help">{$guest_help|escape:'html':'UTF-8'}</p>

        <label class="control-label fewo-special-request-label" for="fewo_special_request">
            {$special_request_label|escape:'html':'UTF-8'}
        </label>
        <textarea
            id="fewo_special_request"
            name="fewo_special_request"
            class="form-control fewo-special-request"
            rows="3"
            maxlength="500"
            placeholder="{$special_request_placeholder|escape:'html':'UTF-8'}"></textarea>
        <p class="help-block fewo-rate-help">{$special_request_help|escape:'html':'UTF-8'}</p>
    </div>
</div>
