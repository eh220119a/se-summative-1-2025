
global.localStorage = {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

document.body.innerHTML = `
    <input type="file" id="csvUpload">
    <div id="notification-message"></div>
    <div id="nameList"></div>
    <table>
        <tbody id="week1-hosts"></tbody>
        <tbody id="week2-hosts"></tbody>
    </table>
`;


document.addEventListener = jest.fn();
document.getElementById = jest.fn((id) => document.querySelector(`#${id}`));