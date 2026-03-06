import { useNotes } from "../contexts/NoteContext";
import { useAuth } from "../contexts/AuthContext";
import { useRef, useState } from "react";
import { apiRequest, sanitizeHtml } from "../utils";

export type NoteProps = {
	_id: number;
	title: string;
	author: {
		name: string;
		email: string;
	};
	content: string;
	user: number;
	isRichText?: boolean;
};

export default function Note({
	_id,
	title,
	author,
	content,
	user,
	isRichText,
}: NoteProps) {
	const currUser = useAuth().user;
	const textAreaRef = useRef<HTMLTextAreaElement>(null);
	const { state, dispatch } = useNotes();
	const { editNoteId } = state;
	const [isRichTextEditing, setIsRichTextEditing] = useState(
		isRichText || false
	);

	const updateDelete = () => {
		dispatch({ type: "noteDeleted", id: _id });

		let newCache = state.notesCache;
		if (state.currentPage > 1 && state.notes.length === 1) {
			dispatch({ type: "setPage", page: state.currentPage - 1 });
			let newCache = state.notesCache;
			newCache.forEach((cache) => {
				cache.fetched = false;
			});
			dispatch({ type: "setCache", notesCache: newCache });
		} else if (state.currentPage < state.notesCache[4].page) {
			const noteToAdd = newCache
				.find((cache) => cache.page === state.currentPage + 1)
				?.notes.shift();
			if (noteToAdd) {
				newCache
					.find((cache) => cache.page === state.currentPage)
					?.notes.push(noteToAdd);
			}
		}
		const updatesNotes = newCache
			.find((cache) => cache.page === state.currentPage)
			?.notes.filter((note) => note._id !== _id);
		newCache.forEach((cache) => {
			cache.fetched = false;
			if (cache.page === state.currentPage) {
				cache.notes = updatesNotes || [];
			}
		});
		dispatch({ type: "setCache", notesCache: newCache });
        if(updatesNotes)
          dispatch({type: "setNotes", notes: updatesNotes, totalCount: state.totalCount - 1});
	};

	const displayContent = state.sanitizer && isRichText? sanitizeHtml(content) : content;
	
	return (
		<div className="note" data-testid={_id.toString()} id={_id.toString()}>
			{editNoteId != _id.toString() ? (
				<>
					<h2>{title}</h2>
					<small>
						{author.name} ({author.email})
					</small>
					<br />
					{isRichText ? (
						<div dangerouslySetInnerHTML={{ __html: displayContent }} />
					) : (
						<p>{displayContent} </p>
					)}
					{currUser && user === currUser._id && (
						<>
							<button
								onClick={() => {
									apiRequest("delete", `notes/${_id}`, undefined, undefined, {
										Authorization: `Bearer ${currUser.token}`,
									})
										.then(() => {
											updateDelete();
										})
										.catch((err) => {
											console.error("Error deleting note:", err);
											dispatch({ type: "noteOperation failed" });
										});
								}}
								data-testid={`delete-${_id.toString()}`}>
								Delete
							</button>
							<button
								data-testid={`edit-${_id.toString()}`}
								onClick={() =>
									dispatch({ type: "setEditing", editNoteId: _id.toString() })
								}>
								Edit
							</button>
						</>
					)}
				</>
			) : (
				<>
					<h2>{title}</h2>
					<small>
						{author.name} ({author.email})
					</small>
					{isRichText ? (
						<div dangerouslySetInnerHTML={{ __html: displayContent }} />
					) : (
						<p>{displayContent} </p>
					)}

					<button
						onClick={() => {
							apiRequest(
								"delete",
								`notes/${_id}`,
								undefined,
								undefined,
								currUser
									? { Authorization: `Bearer ${currUser.token}` }
									: undefined
							)
								.then(() => {
									updateDelete();
								})
								.catch((err) => {
									console.error("Error deleting note:", err);
									dispatch({ type: "noteOperation failed" });
								});
						}}
						data-testid={`delete-${_id.toString()}`}>
						Delete
					</button>
					<textarea
						ref={textAreaRef}
						data-testid={`text_input-${_id.toString()}`}>
						{content}
					</textarea>
					<input
						id="isRichText"
						type="checkbox"
						checked={isRichTextEditing}
						onChange={() => setIsRichTextEditing(!isRichTextEditing)}
					/>
					<label htmlFor="isRichText">Rich Text</label>
					<button
						onClick={() => {
							if (textAreaRef.current) {
								let text = textAreaRef.current.value;
								if (text.length === 0) 
									text += " "; 
								apiRequest(
									"put",
									`notes/${_id}`,
									{
										title,
										author,
										content: text,
										isRichText: isRichTextEditing ?? isRichText,
									},
									undefined,
									currUser
										? { Authorization: `Bearer ${currUser.token}` }
										: undefined
								).then(() => {
									dispatch({
										type: "noteUpdated",
										note: {
											_id,
											title,
											author,
											content: text,
											user: user,
											isRichText: isRichTextEditing,
										},
									});
									let newCache = state.notesCache;
                                    newCache.forEach((cache) => {
                                        if (cache.page === state.currentPage) {
											cache.notes = cache.notes.map((note) =>
												note._id === _id
													? {
														  _id,
														  title,
														  author,
														  isRichText: isRichTextEditing ?? false,
														  content: text,
														  user,
													  }
													: note
											);
                                        }
                                    });
                                    dispatch({ type: "setCache", notesCache: newCache });
								}).catch((err) => {
									console.error("Error updating note:", err)
									dispatch({ type: "noteOperation failed" })
									});
							}
						}}
						data-testid={`text_input_save-${_id.toString()}`}>
						Save
					</button>
					<button
						onClick={() => dispatch({ type: "setEditing", editNoteId: "" })}
						data-testid={`text_input_cancel-${_id.toString()}`}>
						Cancel
					</button>
				</>
			)}
		</div>
	);
}
