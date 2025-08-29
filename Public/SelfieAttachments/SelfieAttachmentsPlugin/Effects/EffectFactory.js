export function buildAssetData(controls) {
    const request = {
        'prompt': '',
        'seed': controls['seedPicker'].value
    };

    request.prompt = controls['promptPicker'].value;

    return request;
}
