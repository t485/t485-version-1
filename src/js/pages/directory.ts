import Database from "../server/Database";
// import Authenticator from "../server/Authenticator";
import { Directory, DirectoryKeys } from "../Directory";
import Scout from "../contact/Scout";
import PhoneNumber from "../contact/PhoneNumber";
import $ from "jquery";
import List from "list.js";
import LinkState from "../utils/LinkState";
import Authenticator from "../server/Authenticator";
import "bootstrap";
import "bootstrap-select";


const directoryKeymap = [
    ["scout", "firstName"], ["scout", "lastName"], ["scout", "email"], ["scout", "homePhone"], ["scout", "slack"],
    ["scout", "jobA"], ["scout", "jobB"], ["scout", "joinDate"], ["scout", "active"], ["scout", "WFATrained"],
    ["scout", "school"], ["scout", "fixedGrade"], ["scout", "currentGrade"], ["scout", "cellPhone"],
    ["father", "firstName"], ["father", "lastName"], ["father", "cellPhone"], ["father", "email"], ["father", "slack"],
    ["mother", "firstName"], ["mother", "lastName"], ["mother", "cellPhone"], ["mother", "email"], ["mother", "slack"],
];
const columnKeymap = [
    ["Scout\'s First Name", "Scout\'s Last Name", "Patrol", "Scout\'s E-mail", "Scout\'s Home Phone", "Slack Username",
        "Troop Jobs", "Date Joined Troop 485", "Active (Y)es/ (R)arely/ (A)ged Out/ (N)o", "Wilderness First Aid Trained",
        "School Attending", "Scout\'s Current Grade", "Scout\'s Cell Phone"],
    ["Father\'s First Name", "Father\'s Last Name", "Father\'s Cell Phone", "Father\'s E-mail", "Father\'s Slack Username or None"],
    ["Mother\'s First Name", "Mother\'s Last Name", "Mother\'s Cell Phone", "Mother\'s E-mail", "Mother\'s Slack Username or None"],
];
const defaultShown = [[0, 1, 2, 3, 4], [0, 1, 3], [0, 1, 3]];
const unknownText = `<i>Unknown</i>`;
const noneText = `<i>None</i>`;

let db = new Database();
let start = new Date().getTime();
let list;

LinkState.preservePage();

let auth = new Authenticator();
auth.onAuthStateChanged(function(user) {
    if (user) {
        init();
    } else {
        $("#loading").addClass("hidden");
        $("#auth").removeClass("hidden");
    }
});

function init() {
    $("#loading").addClass("hidden");
    $("#directory").removeClass("hidden");
    loadHeaders();
    loadData(function(list: List) {
        loadFilterSelects(list);
    });


}


function loadHeaders() {
    let colNum = 0;

    for (let i = 0; i < columnKeymap.length; i++) {
        for (let j = 0; j < columnKeymap[i].length; j++, colNum++) {
            $("#dir-head-inner").append(`
				<th scope="col" class="col-${colNum} header">${columnKeymap[i][j]}</th>
			`);
        }
    }
}

function toString(obj: any) {
    // Alternative to if/else
    switch (true) {
            // We treat "" as undefined
        case obj === "":
        case typeof obj === "undefined":
            return unknownText;
            break;
        case obj === null:
            return noneText;
            break;
        case typeof obj === "string":
            return obj;
            break;
        case typeof obj === "number":
        case obj instanceof PhoneNumber: // Explicitly type it out for clarity and in the method changes.
            return obj.toString();
            break;
        default:
            try {
                return obj.toString();
            } catch (e) {
                return unknownText;
            }
    }
}

function loadData(callback: (list:List)=>void) {
    db.ref("/directory/keys").once("value").then(function(snapshot) {
        let data = snapshot.val();
        let keys: DirectoryKeys;
        keys = {
            id: data.id,
            api: data.api,
            sheets: data.sheets,
            range: "A2:X",

        };

        let url = `https://docs.google.com/spreadsheets/d/${keys.id}/edit`;
        $(".link-google-sheet-dir").attr("href", url);

        let directory = new Directory(keys, directoryKeymap);
        directory.update(function(scout: Scout) {
            let row = [];
            // We use one less then the length because at the end, we will have modified the index by -1 + 2, which means at the end
            // The index will be one more than what it should be at.
            for (let i = 0; i < directoryKeymap.length - 1; i++) {
                let index = i;
                let value = "";
                if (i > 2) {
                    // We add the patrol, but it"s not in the keymap
                    index--;
                }
                if (i > 6) {
                    // In the slot that would contain jobA, we list both jobs, so we skip the jobB.
                    index++;
                }
                if (i > 10) {
                    // We don"t display the fixedGrade.
                    index++;
                }

                if (i == 2) {

                    value = ["Dragons", "Serpents", "Blobfish", "Hawks", "Wildcats", "Cacti"]
                            [["DRAGON", "SERPENT", "BLOBFISH", "HAWK", "WILDCAT", "CACTI"].indexOf(scout.patrol)];
                } else if (directoryKeymap[index][1] === "jobA") {
                    if (!(scout.jobs) || scout.jobs[0] == "") {
                        value = unknownText;
                    } else if (scout.jobs[0] == "N/A") {
                        value = "N/A";
                    } else if (scout.jobs.length > 1 && (scout.jobs[1] == "N/A" || scout.jobs[1] == "")) {
                        value = scout.jobs[0];
                    } else {
                        value = scout["jobs"].join(", ");
                    }
                } else if (directoryKeymap[index][0] == "scout") {
                    value = toString(scout[directoryKeymap[index][1]]);
                } else {
                    // If the property is of the scout, and not the parents, or the property is of a non-null parent
                    // of the scout, then we convert it to a string.
                    value = (directoryKeymap[index][0] == "scout" || scout[directoryKeymap[index][0]])
                            ? toString(directoryKeymap[index][0] == "scout"
                                    ? scout[directoryKeymap[index][1]]
                                    : scout[directoryKeymap[index][0]][directoryKeymap[index][1]])
                            : unknownText;
                }

                row.push(`<td class="col-${i}">${value}</td>`);

            }

            $("#dir-body").append(`<tr>${row.join("")}</tr>`);
        }).then(function() {
            $("#loading-text").addClass("hidden");
            let valueNames = [];
            let count = 0;
            for (let i = 0; i < columnKeymap.length; i++) {
                for (let j = 0; j < columnKeymap[i].length; j++, count++) {
                    valueNames.push("col-" + count);
                }

            }
            const options = {
                valueNames: valueNames,
            };

            let list = new List("directory-list", options);

            let end = new Date().getTime();
            $(".directoryScoutSize").text(directory.getScouts().length + "");
            $(".directoryLoadTime").text((end - start) + "ms");
            $(".directoryLoaded-show").removeClass("hidden");
            console.log("Done in " + (end - start) + "ms");
            console.log(directory);

            callback(list);
        });
    });
}


function loadFilterSelects(list: List) {
    let index = 0;
    for (let i = 0; i < columnKeymap.length; i++) {
        let sortOpts = "";
        let filterOpts = "";

        for (let j = 0; j < columnKeymap[i].length; j++) {
            sortOpts += `<option value="${index}">${columnKeymap[i][j]}</option>`;
            filterOpts += `<option value="${index}" ${defaultShown[i].indexOf(j) > -1 ? "selected" : ""}>${columnKeymap[i][j]}</option>`;
            index ++;
        }

        $("#sortby-select").append(`<optgroup label="${["Scout", "Father", "Mother"][i]}">
            ${sortOpts}
        </optgroup>`);


        $("#filter-select").append(`<optgroup label="${["Scout", "Father", "Mother"][i]}">
            ${filterOpts}
        </optgroup>`);

    }
    $(".select-loading").remove();
    $("#filter-select, #sortby-select, #sortorder-select").removeAttr("disabled");
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
        $("#filter-select, #sortby-select, #sortorder-select").selectpicker("mobile");
    }
    $("#filter-select, #sortby-select, #sortorder-select").selectpicker("refresh");

    console.log(list);
    $("#sortby-select, #sortorder-select").change(function() {
        list.sort("col-" + $("#sortby-select").val(), { order: $("#sortorder-select").val() + ""});
    });
    $("#filter-select").change(function() {
        // @ts-ignore -- #filter-select will always be an array
        let selected:string[] = $("#filter-select").val();
        console.log(selected);
        let selectedIndex = 0;
        for (let i = 0; i < directoryKeymap.length; i ++) {
            if (selected[selectedIndex] === (i + "")) {
                selectedIndex ++;
                $(".col-" + i).removeClass("hidden");
            } else {
                $(".col-" + i).addClass("hidden");
            }

        }
    }).trigger("change");
//TODO: no wrap on phones



}
