{*
* FeWo Lauscha override: single amenity row per feature (no Bootstrap breakpoint triplication).
*}

{block name='hotel_features_block'}
    {if isset($hotelAmenities) && $hotelAmenities}
        <div id="hotelAmenitiesBlock" class="row home_block_container">
            <div class="col-xs-12 col-sm-12 home_amenities_wrapper">
                {if $HOTEL_AMENITIES_HEADING && $HOTEL_AMENITIES_DESCRIPTION}
                    <div class="row home_block_desc_wrapper">
                        <div class="col-md-offset-1 col-md-10 col-lg-offset-2 col-lg-8">
                            {block name='hotel_features_block_heading'}
                                <p class="home_block_heading">{$HOTEL_AMENITIES_HEADING|escape:'htmlall':'UTF-8'}</p>
                            {/block}
                            {block name='hotel_features_block_description'}
                                <p class="home_block_description">{$HOTEL_AMENITIES_DESCRIPTION|escape:'htmlall':'UTF-8'}</p>
                            {/block}
                            <hr class="home_block_desc_line"/>
                        </div>
                    </div>
                {/if}
                {block name='hotel_features_images'}
                    <div class="homeAmenitiesBlock home_block_content fe-amenities-grid">
                        {foreach from=$hotelAmenities item=amenity name=amenityBlock}
                            <div class="row margin-lr-0 fe-amenity-row{if $smarty.foreach.amenityBlock.iteration%2 == 0} fe-amenity-row--reverse{/if}">
                                <div class="col-xs-12 col-sm-6 padding-lr-0 fe-amenity-media">
                                    <div class="amenity_img_primary">
                                        <div class="amenity_img_secondary" style="background-image: url('{$link->getMediaLink("`$module_dir|escape:'htmlall':'UTF-8'`views/img/hotels_features_img/`$amenity.id_features_block|escape:'htmlall':'UTF-8'`.jpg")}')"></div>
                                    </div>
                                </div>
                                <div class="col-xs-12 col-sm-6 padding-lr-0 amenity_desc_cont fe-amenity-copy">
                                    <div class="amenity_desc_primary">
                                        <div class="amenity_desc_secondary">
                                            <p class="amenity_heading">{$amenity['feature_title']|escape:'htmlall':'UTF-8'}</p>
                                            <p class="amenity_description">{$amenity['feature_description']|escape:'htmlall':'UTF-8'}</p>
                                            <hr class="amenity_desc_hr" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/foreach}
                    </div>
                {/block}
            </div>
            <hr class="home_block_seperator"/>
        </div>
    {/if}
{/block}
