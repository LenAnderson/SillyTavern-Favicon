import { saveSettingsDebounced } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';
import { POPUP_RESULT, POPUP_TYPE, Popup } from '../../../popup.js';
import { registerSlashCommand } from '../../../slash-commands.js';
import { isTrueBoolean } from '../../../utils.js';

registerSlashCommand('favicon',
    async(args, value)=>{
        if (isTrueBoolean(args.upload)) {
            const dom = document.createElement('div'); {
                const title = document.createElement('h3'); {
                    title.textContent = 'Upload a picture to use as favicon.';
                    dom.append(title);
                }
                const input = document.createElement('input'); {
                    input.type = 'file';
                    input.style.display = 'block';
                    input.addEventListener('change', async(evt)=>{
                        const file = input.files[0];
                        const reader = new FileReader();
                        const fileIsRead = new Promise(resolve=>reader.addEventListener('load', resolve));
                        reader.readAsDataURL(file);
                        await fileIsRead;
                        value = reader.result;
                        dlg.completeAffirmative();
                    });
                    dom.append(input);
                }
            }
            const dlg = new Popup(dom, POPUP_TYPE.TEXT, null, { okButton:'Cancel' });
            await dlg.show();
            if (dlg.result != POPUP_RESULT.AFFIRMATIVE) {
                return;
            }
        }
        extension_settings.favicon = value.trim().length == 0 ? null : value;
        saveSettingsDebounced();
        updateFavicon();
    },
    [],
    '<span class="monospace">[optional upload=true] (optional dataURI)</span> – Sets the favicon to the provided dataURI or opens a dialog to upload a favicon.',
    true,
    true,
);

const updateFavicon = ()=>{
    /**@type {HTMLLinkElement} */
    let link = document.querySelector('link[rel~=\'icon\']');
    if (!link) {
        link = document.createElement('link'); {
            link.rel = 'icon';
            document.head.append(link);
        }
    }
    link.href = extension_settings.favicon ?? 'favicon.ico';
};

updateFavicon();
