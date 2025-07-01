'use strict';

import { save, load } from 'settings';

export function init() {
	handleSettingsForm();
}

function handleSettingsForm() {
	load('uploads-s3', $('.uploads-settings'));

	$('#save').on('click', () => {
		save('uploads-s3', $('.uploads-settings'));
	})
}