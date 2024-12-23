import { saveSettingsDebounced } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';
import { POPUP_RESULT, POPUP_TYPE, Popup } from '../../../popup.js';
import { registerSlashCommand } from '../../../slash-commands.js';
import { isTrueBoolean } from '../../../utils.js';

registerSlashCommand('favicon',
    async(args, value)=>{
        if (isTrueBoolean(args.get)) {
            return extension_settings.favicon ?? '';
        }
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
    '<span class="monospace">[optional upload=true] [optional get=true] (optional dataURI)</span> – Sets the favicon to the provided dataURI or opens a dialog to upload a favicon.',
    true,
    true,
);

const updateFavicon = async()=>{
    /**@type {HTMLLinkElement} */
    let link = document.querySelector('link[rel~=\'icon\']');
    if (!link) {
        link = document.createElement('link'); {
            link.rel = 'icon';
            document.head.append(link);
        }
    }
    const d = Number(new Date().toISOString().slice(5, 10).replace('-', ''));
    if (d >= 1223) {
        const xmUri = (await (await fetch('/scripts/extensions/third-party/SillyTavern-Favicon/xm.txt')).text()).trim();
        let favProm;
        let xmProm;
        const fav = new Image(); {
            const { promise, resolve } = Promise.withResolvers();
            favProm = promise;
            fav.addEventListener('load', resolve);
            fav.addEventListener('error', resolve);
            fav.src = extension_settings.favicon ?? '/img/apple-icon-114x114.png';
            if (fav.complete) resolve();
        }
        const xm = new Image(); {
            const { promise, resolve } = Promise.withResolvers();
            xmProm = promise;
            xm.addEventListener('load', resolve);
            xm.addEventListener('error', resolve);
            xm.src = xmUri;
            if (xm.complete) resolve();
        }
        await Promise.all([favProm, xmProm]);
        const canvas = document.createElement('canvas'); {
            canvas.width = 144;
            canvas.height = 144;
            const con = canvas.getContext('2d');
            con.drawImage(fav, 0,0, fav.naturalWidth,fav.naturalHeight, 6,45, 90,90);
            con.drawImage(xm, 0,0, 144,89);
        }
        link.href = canvas.toDataURL();
    } else {
        link.href = extension_settings.favicon ?? 'favicon.ico';
    }
};

updateFavicon();
