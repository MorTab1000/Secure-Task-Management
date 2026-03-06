import { useState } from "react";
import { useNotes } from "../contexts/NoteContext";
import { apiRequest } from "../utils";
import { useAuth } from "../contexts/AuthContext";

interface AddNewNoteProps {
	setShowAddNewNote: (value: boolean) => void;
}

export default function AddNewNote({ setShowAddNewNote }: AddNewNoteProps) {
	const { user } = useAuth();
	const [noteText, setNoteText] = useState("");
	const [richText, setRichText] = useState(false);
	const { dispatch, state } = useNotes();
	return (
		<form>
			<div>
				<div>
					<label>
						<input
							type="checkbox"
							data-testid="rich_text_checkbox"
							checked={richText}
							onChange={(e) => {
								setRichText(e.target.checked);
							}}
						/>
						Rich Text
					</label>
				</div>
				<textarea
					value={noteText}
					name="text_input_new_note"
					placeholder="Write a new note"
					onChange={(e) => {
						setNoteText(e.target.value);
					}}
				/>
				<button
					type="submit"
					name="text_input_save_new_note"
					onClick={(e) => {
						e.preventDefault();
						if (noteText && user?._id) {
							setShowAddNewNote(false);
							setNoteText(""); // Clear the input field after saving
							let text = noteText;
							if (text.length == 0) text += " ";
							apiRequest(
								"post",
								"notes",
								{
									title: "default",
									content: text,
									richText: richText,
								},
								undefined,
								user ? { Authorization: `Bearer ${user.token}` } : undefined
							)
								.then((response) => {
									const note = response.data;
									let newCache = state.notesCache;

									if (state.currentPage === 1) {
										dispatch({
											type: "noteAdded",
											title: "default",
											author: {
												name: note.author?.name || "Default Author",
												email: note.author?.email || "Default Author Email",
											},
											content: text,
											_id: note._id,
											user: user?._id,
											isRichText: richText,
										});
									}
									else {
										dispatch({
											type: "updateTotalCount",
											totalCount: state.totalCount + 1,
										});
										if (
											state.currentPage > 1 &&
											state.currentPage == state.notesCache[4].page &&
											state.notes.length < 10
										) {
											let updatesNotes = state.notes;
											let noteToAdd = newCache
												.find((cache) => cache.page === state.currentPage - 1)
												?.notes.pop();
											if (noteToAdd) {
												updatesNotes = [noteToAdd, ...updatesNotes];
												newCache = newCache.map((cache) => {
													if (cache.page === state.currentPage) {
														return {
															...cache,
															notes: updatesNotes,
														};
													} else return cache;
												});
											}

											dispatch({
												type: "setNotes",
												notes: updatesNotes,
												totalCount: state.totalCount + 1,
											});
										}
									}
									newCache.forEach((cache) => {
										cache.fetched = false;
									});
									dispatch({ type: "setCache", notesCache: newCache });
								})
								.catch((error) => {
									dispatch({ type: "noteOperation failed" });
									console.error("Error saving note:", error);
								});
						}
					}}>
					Save
				</button>
				<button
					name="text_input_cancel_new_note"
					onClick={(e) => {
						e.preventDefault();
						setShowAddNewNote(false);
					}}>
					Cancel
				</button>
			</div>
		</form>
	);
}
