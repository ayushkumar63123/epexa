document.addEventListener('DOMContentLoaded', () => {

	initHtmlElements(
		'#address-qrcode',
		'#save-qr-address',
		'#bitgesell-address',
		'#copy-address',
		'#add-new-address-btn',
		'#qr-code-modal',
	);

	new Modal($qrCodeModal);

	const addressQRcode = new QRCode($addressQrcode, {
		width: 256,
		height: 256,
		colorDark: '#000000',
		colorLight: '#ffffff',
		correctLevel: QRCode.CorrectLevel.H,
	});

	const myAddressesTable = $('#my-addresses-table').DataTable(
		$.extend({}, dataTableParams, {
			columns: [
				{ data: 'id' },
				{ data: 'address', render: (data) => { return `<input type="text" class="form-control-plaintext form-control-sm offset-3 col-6 font-weight-bold address" value="${data}" readonly="">`; }, width: '42%', class: 'text-center' },
				{ data: 'balance', render: (data) => { return humanAmountFormat(data); }, class: 'text-center' },
				{ data: 'input_count', class: 'text-center' },
				{ render: (row, display, column) => {
					let btns = '';
					btns += `<a class="btn btn-success btn-sm mr-1" href="#transactions/${column.address}">Transactions</a>`;
					btns += `<button class="btn btn-info btn-sm mr-1 qr-code-btn" data-address="${column.address}">QR Code</button>`;
					btns += `<a class="btn btn-danger btn-sm mr-1" href="#send/${column.address}">Send</a>`;
					btns += `<a class="btn btn-warning btn-sm mr-1" target="_blank" href="https://bgl.bitaps.com/${column.address}">Open in explorer</a>`;
					btns += `<button class="btn btn-primary btn-sm mr-1 copy-address-btn">Copy address</button>`;
					return btns;
				}, class: 'text-right' },
			],
			fnDrawCallback: () => {
				document.querySelectorAll('.qr-code-btn').forEach(($btn) => {
					$btn.addEventListener('click', () => {
						addressQRcode.clear();
						addressQRcode.makeCode(`bitgesell:${$btn.dataset.address}`);
						$saveQrAddress.href = $addressQrcode.querySelector('canvas').toDataURL('image/png').replace(/^data:image\/[^;]/, 'data:application/octet-stream');
						$bitgesellAddress.value = $btn.dataset.address;
						$qrCodeModal.Modal.show();
					});
				});
				document.querySelectorAll('.copy-address-btn').forEach(($btn) => {
					$btn.addEventListener('click', () => {
						const $select = $btn.closest('tr').querySelectorAll('td')[1].querySelector('input');
						copyToBuffer($select);
					});
				});
				document.querySelectorAll('.address').forEach(($input) => {
					$input.addEventListener('click', () => {
						$input.select();
						copyToBuffer($input, false);
					});
				});
			},
		})
	);

	window.myAddressesTableDraw = () => {
		const myAddressesData = [];
		let countAddresses = 0;
		for (const [ key, value ] of Object.entries(storage.addresses)) {
			countAddresses++;
			myAddressesData.push({
				id: countAddresses,
				address: key,
				input_count: value.input_count,
				balance: value.balance,
			});
		}
		myAddressesTable.clear();
		myAddressesTable.rows.add(myAddressesData);
		myAddressesTable.draw(false);
	};

	const hash = window.location.hash.substring(1);
	if (hash === 'my-addresses') {
		window.scrollTo({ top: 0, behavior: 'smooth' });
		myAddressesTableDraw();
	}

	$bitgesellAddress.addEventListener('click', () => {
		$bitgesellAddress.select();
		copyToBuffer($bitgesellAddress, false);
	});

	$copyAddress.addEventListener('click', () => {
		copyToBuffer($bitgesellAddress);
	});

});

const getAddressInfo = (address, callback) => {
	fetch(`//bitgesellexplorer.com/ext/getaddress/${address}`)
			.then((response) => { return response.json(); })
			.then((json) => {
				console.log(json);
				if ( ! json.error) callback(json);
				else alert(json.error);
			});
};
